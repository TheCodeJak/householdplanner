import type { TaskIconName } from "@/lib/taskIcons";
import { taskIconPaths } from "./taskIconPaths";

export const TASK_ICON_SIZES = { sm: 16, md: 20, lg: 24, xl: 32 } as const;
export const TASK_ICON_WEIGHTS = { thin: 1.25, regular: 1.75, bold: 2.25 } as const;

export type TaskIconSize = keyof typeof TASK_ICON_SIZES;
export type TaskIconWeight = keyof typeof TASK_ICON_WEIGHTS;

export type TaskIconProps = {
  name: TaskIconName;
  size?: TaskIconSize;
  weight?: TaskIconWeight;
  /** Beliebiger CSS-Farbwert. Ohne Angabe erbt das Icon die Textfarbe (currentColor). */
  color?: string;
  className?: string;
  /** Wenn gesetzt, wird das Icon für Screenreader beschriftet, sonst ist es dekorativ. */
  title?: string;
};

export function TaskIcon({
  name,
  size = "lg",
  weight = "regular",
  color,
  className,
  title,
}: TaskIconProps) {
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
      // color statt stroke setzen, damit auch die gefüllten Punkte (fill="currentColor") mitfärben
      style={color ? { color } : undefined}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title && <title>{title}</title>}
      {taskIconPaths[name] ?? taskIconPaths.planung}
    </svg>
  );
}
