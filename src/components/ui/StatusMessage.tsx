import type { ErrorKind } from "@/lib/describeError";
import type { ReactNode } from "react";

// Symbol (24×24, Outline wie die Aufgaben-Icons) und Kachelfarbe je Art
const LOOKS: Record<ErrorKind, { path: string; tone: string }> = {
  // WLAN-Symbol, durchgestrichen
  offline: {
    path: "M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 5.2-2.8M19 12.9a10 10 0 0 0-2.5-1.9M2 8.8a15 15 0 0 1 4.3-2.7M22 8.8A15 15 0 0 0 10.7 5M12 20h.01",
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  },
  // zwei Server-Einschübe
  server: {
    path: "M5 4h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM5 13h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2zM7 7.5h.01M7 16.5h.01",
    tone: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  },
  // Schloss
  session: {
    path: "M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zM8 11V7a4 4 0 0 1 8 0v4",
    tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300",
  },
  // Haus
  family: {
    path: "M3 11l9-7.5 9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5",
    tone: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  },
  // Warndreieck
  conflict: {
    path: "M12 3.5l9.5 16.5h-19zM12 10v4.5M12 17.5h.01",
    tone: "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300",
  },
};

/**
 * Große, zentrierte Meldung für leere oder fehlerhafte Zustände:
 * farbige Kachel mit Symbol, Titel, kurzer Text und optional ein Button.
 * Die Kacheln haben denselben Stil wie die Aufgaben-Icons (TaskTile).
 */
export function StatusMessage({
  kind,
  title,
  text,
  action,
}: {
  kind: ErrorKind;
  title: string;
  text: string;
  /** z.B. <Button>Erneut versuchen</Button> */
  action?: ReactNode;
}) {
  const look = LOOKS[kind];

  return (
    // role="alert": Screenreader lesen die Meldung sofort vor, sobald sie erscheint
    <div
      role="alert"
      className="flex flex-col items-center px-6 py-12 text-center"
    >
      <span
        className={`mb-5 flex h-16 w-16 rotate-3 items-center justify-center rounded-[20px] shadow-lg shadow-brand-900/5 ${look.tone}`}
        aria-hidden
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={look.path} />
        </svg>
      </span>
      <h2 className="text-lg font-bold text-fg">{title}</h2>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
        {text}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
