import { db } from "@/db";
import { rateLimit } from "@/db/schema";
import { lt, sql } from "drizzle-orm";

export type RateLimitRule = { limit: number; windowSeconds: number };

export const RATE_LIMITS = {
  loginIp: { limit: 30, windowSeconds: 15 * 60 },
  loginEmail: { limit: 10, windowSeconds: 15 * 60 },
  registerIp: { limit: 10, windowSeconds: 60 * 60 },
  // Familie gründen: pro Nutzer, damit niemand massenhaft Familien anlegt
  familyCreateUser: { limit: 5, windowSeconds: 60 * 60 },
  // Beitreten: Der Code ist das einzige Geheimnis, deshalb sowohl pro Nutzer
  // als auch pro IP begrenzen, damit er sich nicht durchprobieren lässt
  familyJoinUser: { limit: 10, windowSeconds: 15 * 60 },
  familyJoinIp: { limit: 30, windowSeconds: 15 * 60 },
  // Neuen Einladungscode erzeugen (nur Admins)
  familyRegenerateUser: { limit: 10, windowSeconds: 60 * 60 },
} satisfies Record<string, RateLimitRule>;

/**
 * Zählt einen Versuch für `key` und sagt, ob das Limit überschritten ist.
 *
 * Der Zähler liegt in der Datenbank, weil Serverless-Instanzen (Vercel) keinen
 * gemeinsamen Speicher haben. Der Upsert ist atomar: parallele Anfragen können
 * das Limit nicht durch ein Race Condition umgehen. Die Zeit kommt aus der DB
 * (now()), nicht aus der Server-Uhr.
 */
export async function isRateLimited(
  key: string,
  { limit, windowSeconds }: RateLimitRule,
): Promise<boolean> {
  const windowEnd = sql`now() + (${windowSeconds}::int * interval '1 second')`;

  const [row] = await db
    .insert(rateLimit)
    .values({ key, count: 1, resetAt: windowEnd })
    .onConflictDoUpdate({
      target: rateLimit.key,
      set: {
        count: sql`case when ${rateLimit.resetAt} <= now() then 1 else ${rateLimit.count} + 1 end`,
        resetAt: sql`case when ${rateLimit.resetAt} <= now() then ${windowEnd} else ${rateLimit.resetAt} end`,
      },
    })
    .returning({ count: rateLimit.count });

  // Abgelaufene Zeilen gelegentlich wegräumen, damit die Tabelle nicht wächst.
  if (Math.random() < 0.02) {
    await db
      .delete(rateLimit)
      .where(lt(rateLimit.resetAt, sql`now() - interval '1 day'`))
      .catch(() => {});
  }

  return row.count > limit;
}

/**
 * Client-IP aus den Proxy-Headern. Auf Vercel setzt die Plattform diese Header
 * selbst und überschreibt Werte vom Client. Bei Self-Hosting ohne vorgeschalteten
 * Proxy wären sie fälschbar.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
