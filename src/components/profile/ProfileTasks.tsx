"use client";

import { Glyph } from "@/components/icons";
import { CategoryGroup } from "@/components/ui/CategoryGroup";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useOpenCategories } from "@/hooks/useOpenCategories";
import { groupByCategory } from "@/lib/groupByCategory";
import type { TaskTemplate } from "@/types/profile";
import { ArchivedTasks } from "./ArchivedTasks";
import { TaskTemplateList } from "./TaskTemplateList";

/**
 * Bereich "Aufgaben" der Profilseite: Überschrift mit "+ Neu", die aktiven
 * Vorlagen in klappbaren Kategorien, darunter die archivierten.
 */
export function ProfileTasks({
  tasks,
  archived,
  onEdit,
  onRestore,
}: {
  tasks: TaskTemplate[];
  archived: TaskTemplate[];
  /** null = neue Aufgabe anlegen */
  onEdit: (task: TaskTemplate | null) => void;
  onRestore: (task: TaskTemplate) => void;
}) {
  const groups = groupByCategory(tasks);
  // Die ersten beiden Kategorien starten offen, der Rest zu
  const categories = useOpenCategories(
    groups.slice(0, 2).map((g) => g.category),
  );

  return (
    <>
      <SectionLabel
        action={
          <button
            type="button"
            onClick={() => onEdit(null)}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-secondary font-semibold text-on-primary shadow-sm shadow-primary/30"
          >
            <Glyph name="plus" size={13} /> Neu
          </button>
        }
      >
        Aufgaben · {tasks.length}
      </SectionLabel>

      {groups.length === 0 && (
        <p className="rounded-2xl bg-surface px-4 py-6 text-center text-secondary text-subtle">
          Noch keine Aufgaben. Lege die erste mit „Neu“ an.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {groups.map(({ category, items }) => (
          <CategoryGroup
            key={category}
            info={{ name: category, items }}
            open={categories.isOpen(category)}
            onToggle={() => categories.toggle(category)}
          >
            <TaskTemplateList tasks={items} onSelect={onEdit} />
          </CategoryGroup>
        ))}
      </div>

      <ArchivedTasks tasks={archived} onRestore={onRestore} />
    </>
  );
}
