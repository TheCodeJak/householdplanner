"use client";

import { Glyph } from "@/components/icons";
import { ButtonLabel } from "@/components/ui/ButtonLabel";
import { IconButton } from "@/components/ui/IconButton";
import { Button, Modal } from "jaklib/core";
import { useState } from "react";

/** "Kopiert ✓" für 1,5 s. Kopiert wird noch nichts (später: navigator.clipboard) */
function useCopied() {
  const [copied, setCopied] = useState(false);
  return {
    copied,
    copy: () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    },
  };
}

/** "K7PM4XQR" → "K7PM–4XQR", besser vorzulesen und abzutippen */
function formatCode(code: string) {
  return `${code.slice(0, 4)}–${code.slice(4)}`;
}

/**
 * Sheet "Jemanden einladen" mit dem Einladungscode der Familie: Kopieren,
 * Teilen und neuen Code erzeugen. Öffnet sich über den "+"-Kreis bei den
 * Mitgliedern. Teilen und Erneuern haben noch keine Funktion.
 */
export function InviteModal({
  open,
  onClose,
  familyName,
  inviteCode,
}: {
  open: boolean;
  onClose: () => void;
  familyName: string;
  inviteCode: string;
}) {
  const { copied, copy } = useCopied();

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="sheet"
      className="task-sheet"
      aria-label="Jemanden einladen"
    >
      <div className="flex items-center gap-3 bg-linear-to-b from-brand-100 to-transparent px-4 pt-7 pb-3 dark:from-brand-400/15">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-400/15 dark:text-brand-300">
          <Glyph name="mail" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-fg">Jemanden einladen</p>
          <p className="text-xs text-muted">
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
        <button
          type="button"
          onClick={copy}
          className="w-full rounded-2xl glass-inset py-4 text-center"
        >
          <p className="font-mono text-3xl font-bold tracking-[0.2em] text-fg">
            {formatCode(inviteCode)}
          </p>
          <p className="mt-1 text-[11px] text-subtle">
            {copied ? "Kopiert ✓" : "Tippen zum Kopieren"}
          </p>
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="secondary" className="w-full text-sm" onClick={copy}>
            <ButtonLabel icon={copied ? "check" : "copy"}>
              {copied ? "Kopiert" : "Kopieren"}
            </ButtonLabel>
          </Button>
          <Button variant="primary" className="w-full text-sm">
            <ButtonLabel icon="share">Teilen</ButtonLabel>
          </Button>
        </div>

        <button
          type="button"
          className="mx-auto mt-3 flex items-center gap-1.5 text-xs font-medium text-subtle hover:text-muted"
        >
          <Glyph name="refresh" size={13} /> Neuen Code erzeugen
        </button>
      </div>
    </Modal>
  );
}
