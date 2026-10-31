"use client";

import { Glyph } from "@/components/icons";
import { CategoryGroup } from "@/components/ui/CategoryGroup";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useOpenCategories } from "@/hooks/useOpenCategories";
import { categoryKey } from "@/lib/categories";
import { groupTemplatesByCategory } from "@/lib/groupByCategory";
import type { CategoryOption, TaskTemplate } from "@/types/profile";
import { ArchivedTasks } from "./ArchivedTasks";
import { TaskTemplateList } from "./TaskTemplateList";

/**
 * Bereich "Aufgaben" der Profilseite: Überschrift mit "+ Neue Aufgabe", die aktiven
 * Vorlagen in klappbaren Kategorien (auch leere), darunter die archivierten.
 * Kategorien selbst werden nur im Aufgaben-Sheet bearbeitet.
 */
export function ProfileTasks({
  tasks,
  archived,
  categories,
  onEdit,
  onRestore,
}: {
  tasks: TaskTemplate[];
  archived: TaskTemplate[];
  categories: CategoryOption[];
  /** null = neue Aufgabe anlegen */
  onEdit: (task: TaskTemplate | null) => void;
  onRestore: (task: TaskTemplate) => void;
}) {
  const groups = groupTemplatesByCategory(tasks, categories);
  // Die ersten beiden Kategorien starten offen, der Rest zu
  const open = useOpenCategories(
    groups.slice(0, 2).map((g) => categoryKey(g.category)),
  );

  return (
    <>
      <SectionLabel
        action={
          <button
            type="button"
            onClick={() => onEdit(null)}
            // Nur Akzentfarbe, wie "+ Zeitfenster hinzufügen" in den Sheets
            className="inline-flex min-h-9 items-center gap-1 px-1 text-secondary font-semibold text-accent"
          >
            <Glyph name="plus" size={13} /> Neue Aufgabe
          </button>
        }
      >
        Aufgaben · {tasks.length}
      </SectionLabel>

      {groups.length === 0 && (
        <p className="rounded-2xl bg-surface px-4 py-6 text-center text-secondary text-subtle">
          Noch keine Aufgaben. Lege die erste mit „Neue Aufgabe“ an.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {groups.map(({ category, items }) => {
          const key = categoryKey(category);
          return (
            <CategoryGroup
              key={key}
              info={{
                name: category.name,
                tone: category.tone,
                icon: category.icon,
                items,
              }}
              open={open.isOpen(key)}
              onToggle={() => open.toggle(key)}
            >
              {items.length > 0 ? (
                <TaskTemplateList tasks={items} onSelect={onEdit} />
              ) : (
                <p className="px-4 py-3 text-secondary text-subtle">
                  Noch keine Aufgaben in dieser Kategorie.
                </p>
              )}
            </CategoryGroup>
          );
        })}
      </div>

      <ArchivedTasks tasks={archived} onRestore={onRestore} />
    </>
  );
}
