import Link from "next/link";
import { AuthShell } from "../AuthShell";
import { LoginForm } from "./form";
import {
  LOGIN_VARIANTS,
  LoginVariant,
  LoginVariantView,
  VariantSwitcher,
} from "./variants";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  // ⚠️ TEMPORÄR: Design-Varianten, siehe ./variants.tsx
  const { v } = await searchParams;
  const variant: LoginVariant =
    v && Object.hasOwn(LOGIN_VARIANTS, v) ? (v as LoginVariant) : "current";

  if (variant !== "current") {
    return (
      <VariantSwitcher active={variant}>
        <LoginVariantView variant={variant} />
      </VariantSwitcher>
    );
  }

  return (
    <VariantSwitcher active={variant}>
      <AuthShell
        title="Anmelden"
        subtitle="Melde dich mit deiner E-Mail-Adresse und deinem Passwort an."
        icons={[
          "kochen", null, "waschen", "hund",
          null, "einkaufen", "pflanzen", null,
        ]}
        footer={
          <>
            Noch kein Konto?{" "}
            <Link
              href="/register"
              className="inline-block py-2 font-semibold text-brand-600 hover:text-brand-700"
            >
              Registrieren
            </Link>
          </>
        }
      >
        <LoginForm />
      </AuthShell>
    </VariantSwitcher>
  );
}
