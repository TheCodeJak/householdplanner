import { Glyph } from "@/components/icons";
import type { ReactNode } from "react";

/**
 * Kopfzeile der Bearbeiten-Sheets im iOS-Stil: links Abbrechen oder Zurück,
 * mittig der Titel, rechts die Aktion. Klebt oben beim Scrollen.
 *
 * Das Polster oben (18 px) lässt genau Platz für jaklibs Zieh-Griff, der über
 * dem Kopf liegt (siehe .task-sheet in globals.css).
 */
export function SheetHeader({
  left,
  title,
  right,
}: {
  left: ReactNode;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="sticky top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center border-b border-line bg-surface/90 px-3 pt-[18px] pb-2 backdrop-blur">
      <div className="justify-self-start">{left}</div>
      <p className="px-2 text-body font-bold text-fg">{title}</p>
      <div className="justify-self-end">{right}</div>
    </div>
  );
}

/** Abbrechen: ohne Fläche, aber in kräftiger Textfarbe (nicht das blasse Grau) */
export function SheetCancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-2 py-1.5 text-body font-semibold text-fg transition-colors hover:text-fg-2"
    >
      Abbrechen
    </button>
  );
}

export function SheetBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 rounded-full py-1.5 pr-3 pl-1.5 text-body font-medium text-accent"
    >
      <Glyph name="back" size={16} /> Zurück
    </button>
  );
}

export function SheetSaveButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full px-3 py-1.5 text-body font-bold text-accent disabled:text-subtle"
    >
      {children}
    </button>
  );
}
