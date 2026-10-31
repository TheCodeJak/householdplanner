import { TaskIcon } from "@/components/icons";
import { TASK_ICON_NAMES, type TaskIconName } from "@/lib/taskIcons";

/**
 * Alle Aufgaben-Icons als Raster zum Auswählen, das gewählte mit Ring.
 * Bewusst neutral (keine Farbe): Die Farbe einer Aufgabe kommt von ihrer
 * Kategorie, nicht vom Icon.
 */
export function IconGrid({
  value,
  onChange,
}: {
  value: TaskIconName | null;
  onChange: (icon: TaskIconName) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {TASK_ICON_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          aria-label={name}
          aria-pressed={value === name}
          className={`flex aspect-square items-center justify-center rounded-xl bg-surface-2 transition dark:bg-white/5 ${
            value === name
              ? "text-fg ring-2 ring-brand-500 ring-offset-2 ring-offset-surface"
              : "text-muted hover:text-fg"
          }`}
        >
          <TaskIcon name={name} size="md" />
        </button>
      ))}
    </div>
  );
}
