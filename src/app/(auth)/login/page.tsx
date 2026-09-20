import { signIn } from "@/lib/auth";
import { Button } from "@/app/components/shared/button";
import { Input } from "@/app/components/shared/input";

export default function LoginPage() {
  async function action(formData: FormData) {
    "use server";
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Anmelden</h1>
        <form action={action} className="flex flex-col gap-4">
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
            autoComplete="current-password"
          />
          <Button type="submit" size="lg" className="mt-2 w-full">
            Anmelden
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Noch kein Konto?{" "}
          <a
            href="/register"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Registrieren
          </a>
        </p>
      </div>
    </div>
  );
}
