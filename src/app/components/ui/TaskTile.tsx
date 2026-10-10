import { TaskIcon } from "@/app/components/icons";
import {
  TASK_ICON_TONES,
  TaskIconName,
  taskIconTones,
} from "@/lib/taskIcons";

const TILE_SIZES = {
  sm: { box: "h-7 w-7 rounded-lg text-xs", icon: "sm", check: 16 },
  lg: { box: "h-10 w-10 rounded-xl text-sm", icon: "lg", check: 22 },
} as const;

// Pastell-Kachel mit dem Aufgaben-Icon. Ist die Aufgabe erledigt, wird das Icon
// durch ein Häkchen in derselben Farbe ersetzt. Ohne Icon: Anfangsbuchstabe auf Grau.
export function TaskTile({
  icon,
  title,
  completed = false,
  size = "lg",
}: {
  icon: TaskIconName | null;
  title: string;
  completed?: boolean;
  size?: keyof typeof TILE_SIZES;
}) {
  const s = TILE_SIZES[size];
  const tone = TASK_ICON_TONES[icon ? taskIconTones[icon] : "slate"];

  return (
    <span
      className={`flex shrink-0 items-center justify-center font-semibold ${s.box} ${tone}`}
      aria-hidden
    >
      {completed ? (
        <svg
          width={s.check}
          height={s.check}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      ) : icon ? (
        <TaskIcon
          name={icon}
          size={s.icon}
          weight={size === "sm" ? "bold" : "regular"}
        />
      ) : (
        title[0]?.toUpperCase()
      )}
    </span>
  );
}
