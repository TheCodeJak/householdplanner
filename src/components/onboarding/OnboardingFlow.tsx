"use client";

import { logOut } from "@/app/(auth)/actions";
import {
  createFamilyAction,
  joinFamilyAction,
} from "@/app/(auth)/onboarding/actions";
import { AuthShell } from "@/components/layout/AuthShell";
import { ButtonLabel } from "@/components/ui/ButtonLabel";
import { FloatingTiles } from "@/components/ui/FloatingTiles";
import type { FamilyActionResult } from "@/types/profile";
import { Button } from "jaklib/core";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FamilyReady } from "./FamilyReady";
import { CreateFamilyForm, JoinFamilyForm } from "./FamilyForms";

type Step =
  | { kind: "choose" }
  | { kind: "create" }
  | { kind: "ready"; result: Extract<FamilyActionResult, { ok: true }> };

/**
 * Onboarding für Nutzer ohne Familie: Mit einem Einladungscode beitreten oder
 * eine neue Familie gründen. Wer gründet, wird Admin und bekommt einen Code für
 * die anderen. Wer schon eine Familie hat, kommt hier gar nicht an (proxy.ts).
 */
export function OnboardingFlow() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0];

  const [step, setStep] = useState<Step>({ kind: "choose" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goTo(next: Step) {
    setError(null);
    setStep(next);
  }

  // Führt eine Aktion aus und kümmert sich um "läuft" und die Fehlermeldung
  async function run(action: () => Promise<FamilyActionResult>) {
    setPending(true);
    setError(null);
    try {
      const result = await action();
      if (result.ok) setStep({ kind: "ready", result });
      else setError(result.error);
    } catch {
      setError(
        "Das hat nicht geklappt. Prüfe deine Verbindung und versuche es noch einmal.",
      );
    } finally {
      setPending(false);
    }
  }

  const logOutFooter = (
    <>
      Falsches Konto?{" "}
      <button
        type="button"
        onClick={() => logOut()}
        className="inline-block py-2 font-semibold text-brand-600 hover:text-brand-700"
      >
        Abmelden
      </button>
    </>
  );

  // ── Fertig: Code zum Weitergeben bzw. die Mitglieder ─────────────────────
  if (step.kind === "ready") {
    const { result } = step;
    const created = Boolean(result.inviteCode);
    return (
      <AuthShell
        transitionKey="ready"
        title={
          created
            ? `${result.familyName} ist startklar`
            : `Willkommen bei ${result.familyName}!`
        }
        subtitle={
          created
            ? "Gib den Code an die anderen weiter, damit sie beitreten können."
            : "Ab jetzt seht ihr dieselben Aufgaben und verteilt sie gemeinsam."
        }
        illustration={
          <div className="flex justify-center py-2">
            <FloatingTiles icons={["zuhause", "kochen", "hund"]} />
          </div>
        }
        footer={null}
      >
        <FamilyReady
          familyName={result.familyName}
          inviteCode={result.inviteCode}
          members={created ? undefined : result.members}
        />
      </AuthShell>
    );
  }

  // ── Familie gründen ──────────────────────────────────────────────────────
  if (step.kind === "create") {
    return (
      <AuthShell
        transitionKey="create"
        title="Familie gründen"
        subtitle="Gib deiner Familie einen Namen. Den sehen später alle, die dazukommen."
        icons={["zuhause", null, "planung", "kalender"]}
        footer={logOutFooter}
      >
        <CreateFamilyForm
          onSubmit={(name) => run(() => createFamilyAction(name))}
          pending={pending}
          error={error}
        />
        <Button
          variant="text"
          className="mt-1 w-full"
          onClick={() => goTo({ kind: "choose" })}
        >
          <ButtonLabel icon="back">Zurück</ButtonLabel>
        </Button>
      </AuthShell>
    );
  }

  // ── Einstieg: wer einen Code hat, tritt direkt bei ───────────────────────
  return (
    <AuthShell
      transitionKey="choose"
      title={firstName ? `Willkommen, ${firstName}!` : "Willkommen!"}
      subtitle="Tritt mit dem Code deiner Familie bei oder gründe eine neue."
      icons={["zuhause", "kochen", null, "hund"]}
      footer={logOutFooter}
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-fg">
          Hast du einen Einladungscode?
        </p>
        <JoinFamilyForm
          onSubmit={(code) => run(() => joinFamilyAction(code))}
          onEdit={() => setError(null)}
          pending={pending}
          error={error}
        />
        <div className="flex items-center gap-3 text-xs text-subtle">
          <span className="h-px flex-1 bg-line" />
          oder
          <span className="h-px flex-1 bg-line" />
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => goTo({ kind: "create" })}
        >
          Neue Familie gründen
        </Button>
      </div>
    </AuthShell>
  );
}
