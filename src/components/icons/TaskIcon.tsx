import type { TaskIconName } from "@/lib/taskIcons";
import { taskIconPaths } from "./taskIconPaths";

// Nur feste Stufen statt beliebiger Zahlen – so bleiben Größen und
// Strichstärken in der ganzen App einheitlich.
const TASK_ICON_SIZES = { sm: 16, md: 20, lg: 24, xl: 32 } as const;
const TASK_ICON_WEIGHTS = { thin: 1.25, regular: 1.75, bold: 2.25 } as const;

/**
 * Ein Aufgaben-Icon als Inline-SVG im 24×24-Raster.
 *
 * Inline-SVG statt <img src="…svg">: kein extra Request, und die Farbe lässt
 * sich per CSS steuern. Alle Linien nutzen `currentColor`, das Icon übernimmt
 * also die Textfarbe seiner Umgebung (z.B. `className="text-sky-700"`).
 * Das Icon ist rein dekorativ (aria-hidden) – die Bedeutung steht immer als
 * Text daneben.
 */
export function TaskIcon({
  name,
  size = "lg",
  weight = "regular",
  color,
  className,
}: {
  name: TaskIconName;
  size?: keyof typeof TASK_ICON_SIZES;
  weight?: keyof typeof TASK_ICON_WEIGHTS;
  /** Beliebiger CSS-Farbwert. Ohne Angabe gilt die Textfarbe (currentColor). */
  color?: string;
  className?: string;
}) {
  const px = TASK_ICON_SIZES[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={TASK_ICON_WEIGHTS[weight]}
      strokeLinecap="round"
      strokeLinejoin="round"
      // `color` statt `stroke` setzen: so färben auch die gefüllten Punkte
      // (Augen, Kalendertage mit fill="currentColor") mit
      style={color ? { color } : undefined}
      className={className}
      aria-hidden
    >
      {taskIconPaths[name] ?? taskIconPaths.planung}
    </svg>
  );
}
