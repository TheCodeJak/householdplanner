import { TaskIcon } from "@/components/icons";
import {
  TASK_ICON_NAMES,
  TASK_ICON_TONES,
  type TaskIconName,
  taskIconTones,
} from "@/lib/taskIcons";

/** Alle Aufgaben-Icons als Raster zum Auswählen, das gewählte mit Ring */
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
          className={`flex aspect-square items-center justify-center rounded-xl transition ${
            TASK_ICON_TONES[taskIconTones[name]]
          } ${
            value === name
              ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-surface"
              : "opacity-80 hover:opacity-100"
          }`}
        >
          <TaskIcon name={name} size="md" />
        </button>
      ))}
    </div>
  );
}
