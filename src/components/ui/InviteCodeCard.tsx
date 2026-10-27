"use client";

import { Glyph } from "@/components/icons";
import { ButtonLabel } from "@/components/ui/ButtonLabel";
import { formatInviteCode } from "@/lib/inviteCode";
import { Button } from "jaklib/core";
import { useState } from "react";

/**
 * Der Einladungscode groß, mit Kopieren und (wo das Gerät es kann) Teilen.
 * Im Onboarding nach dem Gründen und im Einladungs-Sheet des Profils.
 */
export function InviteCodeCard({
  code,
  familyName,
  showHint = false,
}: {
  code: string;
  familyName: string;
  /** Hinweis, wo man den Code später wiederfindet (nur im Onboarding) */
  showHint?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const text = formatInviteCode(code);
  // Die Karte erscheint erst nach einer Eingabe, also immer im Browser
  const canShare = "share" in navigator;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Zwischenablage nicht erlaubt: der Code steht groß da und lässt sich abtippen
    }
  }

  async function share() {
    try {
      await navigator.share({
        title: "Haushaltsplaner",
        text: `Tritt „${familyName}“ im Haushaltsplaner bei. Einladungscode: ${text}`,
        url: window.location.origin,
      });
    } catch {
      // Abgebrochen: nichts zu tun
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={copy}
        className="w-full rounded-2xl glass-inset py-5 text-center"
        aria-label={`Einladungscode ${text}, antippen zum Kopieren`}
      >
        <p className="font-mono text-headline font-bold tracking-[0.2em] text-fg">
          {text}
        </p>
      </button>
      <div className={`mt-3 grid gap-2 ${canShare ? "grid-cols-2" : ""}`}>
        <Button
          variant="secondary"
          className="w-full text-secondary"
          onClick={copy}
        >
          <ButtonLabel icon={copied ? "check" : "copy"}>
            {copied ? "Kopiert" : "Kopieren"}
          </ButtonLabel>
        </Button>
        {canShare && (
          <Button
            variant="secondary"
            className="w-full text-secondary"
            onClick={share}
          >
            <ButtonLabel icon="share">Teilen</ButtonLabel>
          </Button>
        )}
      </div>
      {showHint && (
        <p className="mt-3 flex items-start gap-1.5 text-caption leading-snug text-muted">
          <Glyph name="mail" size={14} className="mt-px shrink-0" />
          Du findest den Code später jederzeit im Profil unter „Einladen“.
        </p>
      )}
    </div>
  );
}
