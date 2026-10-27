"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { hashPassword, RateLimitedError, signIn, signOut } from "@/lib/auth";
import { registerSchema } from "@/lib/authSchemas";
import { getClientIp, isRateLimited, RATE_LIMITS } from "@/lib/rateLimit";
import { isValidRegistrationCode } from "@/lib/registration";
import { eq, sql } from "drizzle-orm";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type AuthFormState = {
  error?: string;
  name?: string;
  email?: string;
};

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");

  try {
    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (e) {
    if (e instanceof RateLimitedError) {
      return {
        error: "Zu viele Anmeldeversuche. Bitte warte ein paar Minuten.",
        email,
      };
    }
    if (e instanceof AuthError && e.type === "CredentialsSignin") {
      return { error: "E-Mail oder Passwort falsch.", email };
    }
    throw e;
  }
  return { email };
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const registrationCode = String(formData.get("registrationCode") ?? "");

  // Zuerst begrenzen, damit der Beta-Code nicht durchprobiert werden kann.
  const ip = getClientIp(await headers());
  if (await isRateLimited(`register:ip:${ip}`, RATE_LIMITS.registerIp)) {
    return {
      error: "Zu viele Versuche. Bitte versuche es später erneut.",
      name,
      email,
    };
  }

  if (!isValidRegistrationCode(registrationCode)) {
    return { error: "Ungültiger Registrierungscode.", name, email };
  }

  const parsed = registerSchema.safeParse({ name, email, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, name, email };
  }
  const data = parsed.data;

  // Hash vor der Existenzprüfung, damit beide Pfade gleich lange dauern.
  const passwordHash = await hashPassword(data.password);

  const existing = await db.query.user.findFirst({
    where: eq(sql`lower(${user.email})`, data.email),
  });

  // onConflictDoNothing fängt den Fall, dass dieselbe E-Mail gleichzeitig
  // registriert wird (der unique-Constraint entscheidet, nicht die Prüfung oben).
  const [created] = existing
    ? []
    : await db
        .insert(user)
        .values({ name: data.name, email: data.email, passwordHash })
        .onConflictDoNothing()
        .returning({ id: user.id });

  if (!created) {
    return { error: "Registrierung nicht möglich.", name, email };
  }

  redirect("/login");
}

export async function logOut() {
  await signOut();
  redirect("/login");
}
