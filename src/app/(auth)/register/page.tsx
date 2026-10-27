import { AuthShell } from "@/components/layout/AuthShell";
import Link from "next/link";
import { RegisterForm } from "./form";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Konto erstellen"
      // Eine Reihe weniger als beim Login – das Formular hat ein Feld mehr
      icons={["putzen", "kalender", null, "katze"]}
      footer={
        <>
          Bereits ein Konto?{" "}
          <Link
            href="/login"
            className="inline-block py-2 font-semibold text-accent hover:text-primary-hover dark:hover:text-brand-300"
          >
            Anmelden
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
