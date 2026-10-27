import { db } from "@/db";
import { getUserFamily } from "@/db/queries/family";
import { user as userTable } from "@/db/schema";
import {
  MAX_EMAIL_LENGTH,
  MAX_LOGIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "@/lib/authSchemas";
import { getClientIp, isRateLimited, RATE_LIMITS } from "@/lib/rateLimit";
import bcrypt from "bcrypt";
import { eq, sql } from "drizzle-orm";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Gültiger bcrypt-Hash (Kosten 12) eines beliebigen Passworts. Wird verglichen,
// wenn die E-Mail unbekannt ist, damit die Antwortzeit nicht verrät, ob es das
// Konto gibt.
const DUMMY_HASH =
  "$2b$12$F0WSc5sdk5O/Y5AS0cJ1Nu6RbLp5hOmZQWgkgBq3XizinLCNmkeu2";

/** Wird von loginAction erkannt und als verständliche Meldung angezeigt. */
export class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      // Das Rate-Limit sitzt hier und nicht in der Server Action, denn
      // POST /api/auth/callback/credentials erreicht authorize auch direkt.
      authorize: async (credentials, request) => {
        const rawEmail = credentials?.email;
        const password = credentials?.password;
        if (typeof rawEmail !== "string" || typeof password !== "string") {
          return null;
        }
        if (
          !rawEmail ||
          !password ||
          rawEmail.length > MAX_EMAIL_LENGTH ||
          password.length > MAX_LOGIN_PASSWORD_LENGTH
        ) {
          return null;
        }

        const email = normalizeEmail(rawEmail);
        const ip = getClientIp(request.headers);
        if (
          (await isRateLimited(`login:ip:${ip}`, RATE_LIMITS.loginIp)) ||
          (await isRateLimited(`login:email:${email}`, RATE_LIMITS.loginEmail))
        ) {
          throw new RateLimitedError();
        }

        // lower() findet auch ältere Konten, die mit Großbuchstaben angelegt wurden.
        const user = await db.query.user.findFirst({
          where: eq(sql`lower(${userTable.email})`, email),
        });

        // Immer vergleichen, auch ohne Konto (siehe DUMMY_HASH).
        const valid = await verifyPassword(
          password,
          user?.passwordHash ?? DUMMY_HASH,
        );
        if (!user || !valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          familyId: user.familyId,
        };
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    jwt: async ({ token, user, trigger }) => {
      if (user) {
        token.sub = user.id;
        token.familyId = user.familyId;
      }
      // Die Familie im Token stammt vom Anmelden. Nach dem Gründen oder
      // Beitreten wird es über unstable_update aufgefrischt (trigger
      // "update"). Fehlt die Familie noch (Konto ohne Familie, oder ein Token
      // aus der Zeit vor dem Feld), kommt der aktuelle Wert aus der DB. Daten,
      // die der Browser mit update() mitschickt, werden bewusst nie
      // übernommen: Sonst könnte jeder sich selbst eine Familie ins Token
      // schreiben.
      if ((trigger === "update" || !token.familyId) && token.sub) {
        token.familyId = await getUserFamily(token.sub);
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: { ...session.user, id: token.sub!, familyId: token.familyId },
    }),
  },
});
