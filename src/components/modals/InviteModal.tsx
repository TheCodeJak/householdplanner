"use client";

import { Glyph } from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { InviteCodeCard } from "@/components/ui/InviteCodeCard";
import { Button, Modal } from "jaklib/core";
import { useState } from "react";

/**
 * Sheet "Jemanden einladen" mit dem Einladungscode der Familie: Kopieren,
 * Teilen und (nur für Admins) einen neuen Code erzeugen. Öffnet sich über den
 * "+"-Kreis bei den Mitgliedern.
 *
 * Ältere Familien haben noch keinen Code. Dann kann ein Admin einen erzeugen,
 * alle anderen sehen einen Hinweis.
 */
export function InviteModal({
  open,
  onClose,
  familyName,
  inviteCode,
  canRegenerate,
  onRegenerate,
  isPending,
  errorText,
}: {
  open: boolean;
  onClose: () => void;
  familyName: string;
  /** null = die Familie hat noch keinen Code */
  inviteCode: string | null;
  /** Nur Admins dürfen einen neuen Code erzeugen */
  canRegenerate: boolean;
  onRegenerate: () => void;
  isPending: boolean;
  errorText: string | null;
}) {
  // Ein neuer Code macht den alten ungültig: erst nachfragen
  const [confirming, setConfirming] = useState(false);

  return (
    <Modal
      open={open}
      onClose={() => {
        setConfirming(false);
        onClose();
      }}
      variant="sheet"
      className="task-sheet"
      aria-label="Jemanden einladen"
    >
      <div className="flex items-center gap-3 bg-linear-to-b from-brand-100 to-transparent px-4 pt-7 pb-3 dark:from-brand-400/15">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-400/15 dark:text-brand-300">
          <Glyph name="mail" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-body font-bold text-fg">Jemanden einladen</p>
          <p className="text-secondary text-muted">
            Mit diesem Code tritt man {familyName} bei.
          </p>
        </div>
        <IconButton
          icon="close"
          label="Schließen"
          onClick={onClose}
          variant="plain"
        />
      </div>

      <div className="px-4 pb-4">
        {errorText && (
          <div className="mb-3">
            <InlineAlert text={errorText} />
          </div>
        )}

        {inviteCode ? (
          <InviteCodeCard code={inviteCode} familyName={familyName} />
        ) : (
          <div className="rounded-2xl glass-inset px-4 py-5 text-center text-secondary text-fg-2">
            {canRegenerate
              ? "Diese Familie hat noch keinen Einladungscode."
              : "Diese Familie hat noch keinen Einladungscode. Bitte einen Admin, einen zu erzeugen."}
          </div>
        )}

        {canRegenerate &&
          (!inviteCode ? (
            <Button
              className="mt-3 w-full"
              loading={isPending}
              disabled={isPending}
              onClick={onRegenerate}
            >
              Code erzeugen
            </Button>
          ) : confirming ? (
            <div className="mt-3 rounded-2xl bg-surface-2/70 p-3 dark:bg-black/20">
              <p className="text-secondary leading-snug text-fg-2">
                Der bisherige Code funktioniert danach nicht mehr. Wer ihn schon
                hat, kann dann nicht mehr beitreten.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  className="w-full text-secondary"
                  onClick={() => setConfirming(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  className="w-full text-secondary"
                  loading={isPending}
                  disabled={isPending}
                  onClick={() => {
                    onRegenerate();
                    setConfirming(false);
                  }}
                >
                  Neu erzeugen
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mx-auto mt-3 flex items-center gap-1.5 text-secondary font-medium text-subtle hover:text-muted"
            >
              <Glyph name="refresh" size={13} /> Neuen Code erzeugen
            </button>
          ))}
      </div>
    </Modal>
  );
}
