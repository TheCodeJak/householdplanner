import { PERSON_COLORS, freeColor, personColor } from "@/lib/color";
import { INVITE_CODE_ALPHABET, INVITE_CODE_LENGTH } from "@/lib/inviteCode";
import type { FamilyMember, FamilyOverview } from "@/types/profile";
import { randomInt } from "node:crypto";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  isNotNull,
  isNull,
  lt,
  sql,
} from "drizzle-orm";
import { db } from "..";
import { family, task, taskAssignment, user } from "../schema";

export async function getUserFamily(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ familyId: user.familyId })
    .from(user)
    .where(eq(user.id, userId));
  return row?.familyId ?? null;
}

/** Familie und Farbe des Nutzers: das, was das Anmelde-Token von ihm mitführt */
export async function getUserMembership(
  userId: string,
): Promise<{ familyId: string | null; color: string | null }> {
  const [row] = await db
    .select({ familyId: user.familyId, color: user.color })
    .from(user)
    .where(eq(user.id, userId));
  return { familyId: row?.familyId ?? null, color: row?.color ?? null };
}

// ── Einladungscodes ─────────────────────────────────────────────────────────

/** Ein zufälliger Code, z.B. "K7PM4XQR" (kryptografisch zufällig, nicht Math.random) */
export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_ALPHABET[randomInt(INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

// Sicherungsnetz gegen eine Endlosschleife (etwa bei einem kaputten Generator).
// Bei 32^8 möglichen Codes kommt eine Wiederholung praktisch nie vor.
const MAX_CODE_ATTEMPTS = 20;

// ── Familie gründen ─────────────────────────────────────────────────────────

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type CreateFamilyResult = {
  familyId: string;
  name: string;
  inviteCode: string;
};

/**
 * Legt eine Familie an; der Nutzer wird ihr Admin. Gibt null zurück, wenn er
 * schon in einer Familie ist (oder nicht existiert).
 */
export function createFamily(data: {
  userId: string;
  name: string;
}): Promise<CreateFamilyResult | null> {
  return db.transaction((tx) => applyCreateFamily(tx, data));
}

/**
 * Die Änderung selbst, getrennt von der Transaktion (so lässt sie sich in einer
 * zurückgerollten Transaktion testen; `generate` lässt sich dabei vorgeben).
 */
export async function applyCreateFamily(
  tx: Tx,
  { userId, name }: { userId: string; name: string },
  generate: () => string = generateInviteCode,
): Promise<CreateFamilyResult | null> {
  // Nutzer-Zeile sperren: Zwei gleichzeitige Anfragen können nicht beide eine
  // Familie anlegen, die zweite sieht danach die Familie der ersten.
  const [me] = await tx
    .select({ familyId: user.familyId })
    .from(user)
    .where(eq(user.id, userId))
    .for("update");
  if (!me || me.familyId) return null;

  // Doppelte Codes: Der Unique-Index entscheidet (nicht eine vorherige
  // Abfrage, die man überholen könnte). Gab es den Code schon, legt
  // onConflictDoNothing nichts an, und es wird ein neuer erzeugt.
  let created:
    { id: string; name: string; inviteCode: string | null } | undefined;
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS && !created; attempt++) {
    [created] = await tx
      .insert(family)
      .values({ name, inviteCode: generate() })
      .onConflictDoNothing({ target: family.inviteCode })
      .returning({
        id: family.id,
        name: family.name,
        inviteCode: family.inviteCode,
      });
  }
  if (!created?.inviteCode) {
    throw new Error("Es konnte kein freier Einladungscode erzeugt werden.");
  }

  await tx
    .update(user)
    .set({ familyId: created.id, isAdmin: true, color: PERSON_COLORS[0] })
    .where(eq(user.id, userId));

  return {
    familyId: created.id,
    name: created.name,
    inviteCode: created.inviteCode,
  };
}

// ── Beitreten ───────────────────────────────────────────────────────────────

export type JoinFamilyResult =
  | { ok: true; familyId: string; name: string }
  | { ok: false; reason: "no_user" | "already_in_family" | "unknown_code" };

/**
 * Nimmt den Nutzer mit einem Einladungscode in eine Familie auf (als normales
 * Mitglied). `code` muss schon bereinigt sein (parseInviteCode).
 */
export async function joinFamily(
  { userId, code }: { userId: string; code: string },
  executor: Pick<typeof db, "select" | "update"> = db,
): Promise<JoinFamilyResult> {
  const [me] = await executor
    .select({ familyId: user.familyId })
    .from(user)
    .where(eq(user.id, userId));
  if (!me) return { ok: false, reason: "no_user" };
  if (me.familyId) return { ok: false, reason: "already_in_family" };

  const [target] = await executor
    .select({ id: family.id, name: family.name })
    .from(family)
    .where(eq(family.inviteCode, code));
  if (!target) return { ok: false, reason: "unknown_code" };

  // Die Farbe: die erste, die in der Familie noch frei ist
  const members = await executor
    .select({ color: user.color })
    .from(user)
    .where(eq(user.familyId, target.id));
  const color = freeColor(members.map((m) => m.color));

  // "where family_id is null": Hat der Nutzer in der Zwischenzeit anderswo
  // beigetreten, ändert dieses Update nichts
  const updated = await executor
    .update(user)
    .set({ familyId: target.id, color })
    .where(and(eq(user.id, userId), isNull(user.familyId)))
    .returning({ id: user.id });
  if (updated.length === 0) return { ok: false, reason: "already_in_family" };

  return { ok: true, familyId: target.id, name: target.name };
}

// ── Mitglieder und Überblick ────────────────────────────────────────────────

/** Die Mitglieder einer Familie: Admins zuerst, danach nach Beitritt */
export async function getFamilyMembers(
  { familyId, currentUserId }: { familyId: string; currentUserId: string },
  executor: Pick<typeof db, "select"> = db,
): Promise<FamilyMember[]> {
  const rows = await executor
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      color: user.color,
    })
    .from(user)
    .where(eq(user.familyId, familyId))
    .orderBy(desc(user.isAdmin), asc(user.createdAt));

  return rows.map((row) => ({
    ...row,
    // Rückfall nur für Konten ohne Farbe (vor dem Umzug scripts/backfill-colors.mjs)
    color: row.color ?? personColor(0),
    isCurrentUser: row.id === currentUserId,
  }));
}

/** Name, Code, Mitglieder und die Wochenstatistik der Familie */
export async function getFamilyOverview(
  { familyId, userId }: { familyId: string; userId: string },
  executor: Pick<typeof db, "select"> = db,
): Promise<FamilyOverview | null> {
  const [row] = await executor
    .select({ name: family.name, inviteCode: family.inviteCode })
    .from(family)
    .where(eq(family.id, familyId));
  if (!row) return null;

  const members = await getFamilyMembers(
    { familyId, currentUserId: userId },
    executor,
  );

  // Erledigte Einträge der laufenden Woche (Montag bis Sonntag, Datum aus der DB)
  const [done] = await executor
    .select({ n: sql<number>`count(*)::int` })
    .from(taskAssignment)
    .innerJoin(task, eq(task.id, taskAssignment.taskId))
    .where(
      and(
        eq(task.familyId, familyId),
        isNotNull(taskAssignment.completedAt),
        gte(taskAssignment.date, sql`date_trunc('week', current_date)::date`),
        lt(
          taskAssignment.date,
          sql`(date_trunc('week', current_date) + interval '7 days')::date`,
        ),
      ),
    );

  return { ...row, members, doneThisWeek: done?.n ?? 0 };
}

// ── Neuer Einladungscode (nur Admins) ───────────────────────────────────────

export type RegenerateResult =
  { ok: true; inviteCode: string } | { ok: false; reason: "not_admin" };

/**
 * Erzeugt einen neuen Code und ersetzt den alten (der alte funktioniert dann
 * nicht mehr). Auch für Familien, die noch keinen haben. Nur Admins.
 */
export async function regenerateInviteCode(
  { familyId, userId }: { familyId: string; userId: string },
  executor: Pick<typeof db, "select" | "update"> = db,
  generate: () => string = generateInviteCode,
): Promise<RegenerateResult> {
  const [admin] = await executor
    .select({ id: user.id })
    .from(user)
    .where(
      and(
        eq(user.id, userId),
        eq(user.familyId, familyId),
        eq(user.isAdmin, true),
      ),
    );
  if (!admin) return { ok: false, reason: "not_admin" };

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const inviteCode = generate();
    // "not exists": nur schreiben, wenn der Code noch zu keiner Familie gehört
    const rows = await executor
      .update(family)
      .set({ inviteCode })
      .where(
        and(
          eq(family.id, familyId),
          sql`not exists (select 1 from "family" f2 where f2.invite_code = ${inviteCode})`,
        ),
      )
      .returning({ id: family.id });
    if (rows.length > 0) return { ok: true, inviteCode };
  }
  throw new Error("Es konnte kein freier Einladungscode erzeugt werden.");
}
