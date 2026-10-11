// Runder Button nur mit Symbol (Pfeil links/rechts oder X).
// Da kein Text sichtbar ist, braucht er ein `label` für Screenreader (aria-label).

const PATHS = {
  left: "M15 5l-7 7 7 7",
  right: "M9 5l7 7-7 7",
  close: "M6 6l12 12M18 6L6 18",
} as const;

export function IconButton({
  icon,
  label,
  onClick,
  variant = "glass",
}: {
  icon: keyof typeof PATHS;
  label: string;
  onClick: () => void;
  /** glass = mit Fläche (glass-pill, siehe globals.css), plain = nur Symbol */
  variant?: "glass" | "plain";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
        variant === "glass"
          ? "glass-pill text-muted hover:text-fg-2"
          : "text-subtle hover:bg-surface/70 hover:text-fg-2"
      }`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={PATHS[icon]} />
      </svg>
    </button>
  );
}
