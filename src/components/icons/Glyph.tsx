// Kleine Strich-Symbole für Bedienelemente (Kopieren, Teilen, Pfeile …).
// Die Aufgaben-Icons sind etwas anderes, die liegen in TaskIcon.

const GLYPHS = {
  copy: "M8 8h12v12H8z M4 16V4h12",
  share: "M12 3v12 M7 8l5-5 5 5 M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6",
  refresh: "M20 11a8 8 0 1 0-2.3 5.7 M20 4v7h-7",
  mail: "M3 6h18v12H3z M3 7l9 6 9-6",
  chevron: "M9 5l7 7-7 7",
  back: "M15 5l-7 7 7 7",
  plus: "M12 5v14 M5 12h14",
  pencil: "M4 20h4L19 9l-4-4L4 16v4z M14 6l4 4",
  logout: "M9 4H5v16h4 M14 8l4 4-4 4 M18 12H9",
  lock: "M6 11h12v9H6z M8 11V8a4 4 0 0 1 8 0v3",
  grip: "M9 6h.01 M15 6h.01 M9 12h.01 M15 12h.01 M9 18h.01 M15 18h.01",
  close: "M6 6l12 12M18 6L6 18",
  check: "M5 12.5l4.5 4.5L19 7.5",
  crown: "M3 8l4 4 5-6 5 6 4-4-2 11H5z",
  users:
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21a7 7 0 0 1 14 0 M16 3.5a4 4 0 0 1 0 7.5 M22 21a7 7 0 0 0-4-6.3",
  restore: "M4 12a8 8 0 1 0 2.3-5.7 M4 4v5h5",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M12 7v5l3 2",
} as const;

export type GlyphName = keyof typeof GLYPHS;

/**
 * Ein Symbol im 24er-Raster, Farbe = Textfarbe (currentColor).
 * Rein dekorativ (aria-hidden) – Buttons brauchen Text oder ein aria-label.
 */
export function Glyph({
  name,
  size = 18,
  className,
}: {
  name: GlyphName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      // Punkte (Griff) brauchen einen dickeren Strich, sonst sind sie unsichtbar
      strokeWidth={name === "grip" ? 3 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={GLYPHS[name]} />
    </svg>
  );
}
