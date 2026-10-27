import { AuthShell } from "@/components/layout/AuthShell";
import Link from "next/link";
import { LoginForm } from "./form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Anmelden"
      subtitle="Melde dich mit deiner E-Mail-Adresse und deinem Passwort an."
      icons={["kochen", null, "waschen", "hund"]}
      footer={
        <>
          Noch kein Konto?{" "}
          {/* inline-block py-2: größere Tippfläche, ohne die Zeile höher zu machen */}
          <Link
            href="/register"
            className="inline-block py-2 font-semibold text-accent hover:text-primary-hover dark:hover:text-brand-300"
          >
            Registrieren
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
