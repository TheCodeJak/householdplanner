import { Button } from "@/app/components/shared/button";
import FamilyModal from "@/app/components/shared/familyModal";
import { Input } from "@/app/components/shared/input";
import { db } from "@/db";
import { user } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { TextField } from "jaklib";
import { redirect } from "next/navigation";

export default function RegisterPage() {
  async function action(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const existing = await db.query.user.findFirst({
      where: eq(user.email, email),
    });
    if (existing) return;

    const passwordHash = await hashPassword(password);
    await db.insert(user).values({ name, email, passwordHash });

    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">
          Registrieren
        </h1>
        <form action={action} className="flex flex-col gap-4">
          <TextField label="Name" name="name" />
          <TextField label="E-Mail" name="email" />
          <TextField label="Passwort" name="password" />
          <Input
            label="Name"
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
          />
          <Input
            label="E-Mail"
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          <Input
            label="Passwort"
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
          />
          <FamilyModal />
          <Button type="submit" size="lg" className="mt-2 w-full">
            Konto erstellen
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Bereits ein Konto?{" "}
          <a
            href="/login"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Anmelden
          </a>
        </p>
      </div>
    </div>
  );
}
