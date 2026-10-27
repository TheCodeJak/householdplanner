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
  size = "md",
}: {
  icon: keyof typeof PATHS;
  label: string;
  onClick: () => void;
  /** glass = mit Fläche (glass-pill, siehe globals.css), plain = nur Symbol */
  variant?: "glass" | "plain";
  /** md = 36 px (Standard), sm = 28 px für dichte Leisten */
  size?: "md" | "sm";
}) {
  const small = size === "sm";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex shrink-0 items-center justify-center rounded-full transition-colors ${
        small ? "h-7 w-7" : "h-9 w-9"
      } ${
        variant === "glass"
          ? "glass-pill text-muted hover:text-fg-2"
          : "text-subtle hover:bg-surface/70 hover:text-fg-2"
      }`}
    >
      <svg
        width={small ? 13 : 15}
        height={small ? 13 : 15}
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
