import { TaskIcon } from "@/components/icons";
import {
  TASK_ICON_TONES,
  TaskIconName,
  TaskIconTone,
  taskIconTones,
} from "@/lib/taskIcons";

/** Passende Icon-Stufe zur Kachelgröße */
function iconSizeFor(size: number) {
  if (size >= 56) return "xl";
  if (size >= 40) return "lg";
  if (size >= 30) return "md";
  return "sm";
}

/**
 * Pastell-Kachel mit dem Aufgaben-Icon (Standard 40×40).
 * - erledigt: Häkchen statt Icon, in derselben Farbe
 * - ohne Icon: Anfangsbuchstabe des Titels auf neutralem Grund
 * Die Farben (Fläche + Icon, hell und dunkel) kommen aus TASK_ICON_TONES: in der
 * Farbe der Kategorie, wenn `tone` gesetzt ist, sonst in der des Icons.
 * Radius und Schrift wachsen mit `size` (bei 40: rounded-xl, 14 px).
 * Rein dekorativ (aria-hidden): Der Titel steht immer als Text daneben.
 */
export function TaskTile({
  icon,
  title,
  completed = false,
  size = 40,
  tone,
}: {
  icon: TaskIconName | null;
  title: string;
  completed?: boolean;
  size?: number;
  tone?: TaskIconTone;
}) {
  const toneClasses =
    TASK_ICON_TONES[tone ?? (icon ? taskIconTones[icon] : "slate")];

  return (
    <span
      className={`flex shrink-0 items-center justify-center font-semibold ${toneClasses}`}
      // Größe ist ein Laufzeitwert → inline statt Tailwind-Klasse
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        fontSize: size * 0.35,
      }}
      aria-hidden
    >
      {completed ? (
        <svg
          width={size * 0.55}
          height={size * 0.55}
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
        <TaskIcon name={icon} size={iconSizeFor(size)} />
      ) : (
        title[0]?.toUpperCase()
      )}
    </span>
  );
}
