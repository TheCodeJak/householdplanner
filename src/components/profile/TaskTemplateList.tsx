import { Glyph } from "@/components/icons";
import { TaskTile } from "@/components/ui/TaskTile";
import { slotSummary } from "@/lib/planText";
import type { TaskTemplate } from "@/types/profile";

/**
 * Aufgaben-Vorlagen einer Kategorie als Liste: Titel fett, Zeitfenster
 * ausgeschrieben darunter. Titel werden nie abgeschnitten, sie brechen um.
 */
export function TaskTemplateList({
  tasks,
  onSelect,
}: {
  tasks: TaskTemplate[];
  onSelect: (task: TaskTemplate) => void;
}) {
  return (
    <div className="flex flex-col py-1">
      {tasks.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(t)}
          className="flex w-full items-center gap-3 px-3 py-2 text-left"
        >
          <TaskTile icon={t.icon} title={t.title} />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-fg">
              {t.title}
            </span>
            <span className="block text-[11px] text-subtle">
              {slotSummary(t.slots)}
            </span>
          </span>
          <Glyph name="chevron" size={14} className="text-subtle" />
        </button>
      ))}
    </div>
  );
}
