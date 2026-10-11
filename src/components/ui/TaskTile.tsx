import { TaskIcon } from "@/components/icons";
import { TASK_ICON_TONES, TaskIconName, taskIconTones } from "@/lib/taskIcons";

/**
 * Pastell-Kachel mit dem Aufgaben-Icon (40×40).
 * - erledigt: Häkchen statt Icon, in derselben Farbe
 * - ohne Icon: Anfangsbuchstabe des Titels auf neutralem Grund
 * Die Farben (Fläche + Icon, hell und dunkel) kommen aus TASK_ICON_TONES.
 * Rein dekorativ (aria-hidden): Der Titel steht immer als Text daneben.
 */
export function TaskTile({
  icon,
  title,
  completed = false,
}: {
  icon: TaskIconName | null;
  title: string;
  completed?: boolean;
}) {
  const tone = TASK_ICON_TONES[icon ? taskIconTones[icon] : "slate"];

  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${tone}`}
      aria-hidden
    >
      {completed ? (
        <svg
          width="22"
          height="22"
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
        <TaskIcon name={icon} size="lg" />
      ) : (
        title[0]?.toUpperCase()
      )}
    </span>
  );
}
