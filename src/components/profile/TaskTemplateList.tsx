import { Glyph } from "@/components/icons";
import { TaskTile } from "@/components/ui/TaskTile";
import type { TaskTemplate } from "@/types/profile";

/**
 * Aufgaben-Vorlagen einer Kategorie als Liste: Titel fett, darunter die
 * Zeitfenster ("Morgens · Abends"), aber nur, wenn es welche gibt. Titel werden
 * nie abgeschnitten, sie brechen um.
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
          <TaskTile icon={t.icon} title={t.title} tone={t.category.tone} />
          <span className="min-w-0 flex-1">
            <span className="block text-body font-semibold text-fg">
              {t.title}
            </span>
            {t.slots.length > 0 && (
              <span className="block text-secondary text-subtle">
                {t.slots.map((s) => s.label).join(" · ")}
              </span>
            )}
          </span>
          <Glyph name="chevron" size={14} className="text-subtle" />
        </button>
      ))}
    </div>
  );
}
