/**
 * Kleiner Hinweis-Balken für Fehler, die den Rest der Seite nicht blockieren,
 * z.B. im Detail-Sheet oder wenn ältere Daten noch angezeigt werden.
 * Optional mit einem Text-Button rechts (z.B. "Erneut versuchen").
 */
export function InlineAlert({
  text,
  actionLabel,
  onAction,
}: {
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    // role="alert": Screenreader lesen den Hinweis vor, sobald er erscheint
    <div
      role="alert"
      className="flex items-center gap-2.5 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:bg-rose-400/10 dark:text-rose-200"
    >
      {/* Ausrufezeichen im Kreis */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="shrink-0"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5M12 16h.01" />
      </svg>
      <span className="min-w-0 flex-1 leading-snug">{text}</span>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 py-1 text-xs font-semibold underline underline-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
