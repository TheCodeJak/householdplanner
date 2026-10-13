"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { hashPassword, signIn } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
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

  const existing = await db.query.user.findFirst({
    where: eq(user.email, email),
  });
  if (existing) {
    return { error: "Diese E-Mail ist bereits registriert.", name, email };
  }

  const passwordHash = await hashPassword(password);
  await db.insert(user).values({ name, email, passwordHash });

  redirect("/login");
}
