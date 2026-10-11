import Link from "next/link";
import { AuthShell } from "@/components/layout/AuthShell";
import { RegisterForm } from "./form";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Konto erstellen"
      subtitle="Mit einem Konto planst und verteilst du Haushaltsaufgaben in deiner Familie."
      // Eine Reihe weniger als beim Login – das Formular hat ein Feld mehr
      icons={["putzen", "kalender", null, "katze"]}
      footer={
        <>
          Bereits ein Konto?{" "}
          <Link
            href="/login"
            className="inline-block py-2 font-semibold text-brand-600 hover:text-brand-700"
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
