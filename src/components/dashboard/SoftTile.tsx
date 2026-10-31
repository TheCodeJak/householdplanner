import { TaskIcon } from "@/components/icons";
import { toneVars } from "@/components/ui/CategoryGroup";
import type { TaskIconName, TaskIconTone } from "@/lib/taskIcons";

/** Icon-Stufe zur Kachelgröße (wie in TaskTile) */
const iconSize = (size: number) =>
  size >= 40 ? "lg" : size >= 30 ? "md" : "sm";

/**
 * Dezente Kachel einer Aufgabe im Dashboard: Das Icon trägt die Farbe der
 * Kategorie, aber gedämpft (zur Hälfte mit dem gedämpften Text gemischt), die
 * Fläche ist nur ein Hauch der Kategoriefarbe auf dem neutralen Grund. So sieht
 * man die Zugehörigkeit, ohne dass die Kacheln leuchten (TaskTile ist die
 * kräftigere Fassung für Profil und Dialoge).
 * - erledigt: Häkchen statt Icon
 * - ohne Icon: Anfangsbuchstabe des Titels
 * Rein dekorativ (aria-hidden): Der Titel steht immer als Text daneben.
 */
export function SoftTile({
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
  tone: TaskIconTone;
}) {
  return (
    <span
      aria-hidden
      // Größe ist ein Laufzeitwert → inline statt Tailwind-Klasse
      style={{
        ...toneVars(tone),
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        fontSize: size * 0.35,
      }}
      className="flex shrink-0 items-center justify-center bg-[color-mix(in_oklab,var(--tone-100)_45%,var(--app-surface-2))] font-semibold text-[color-mix(in_oklab,var(--tone-600)_62%,var(--app-muted))] dark:bg-[color-mix(in_oklab,var(--tone-600)_16%,var(--app-surface-2))]"
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
        <TaskIcon name={icon} size={iconSize(size)} />
      ) : (
        title[0]?.toUpperCase()
      )}
    </span>
  );
}
