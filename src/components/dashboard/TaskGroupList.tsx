"use client";

import { CategoryGroup } from "@/components/ui/CategoryGroup";
import { useMe } from "@/hooks/useMe";
import { useOpenState } from "@/hooks/useOpenState";
import { categoryKey } from "@/lib/categories";
import { groupByCategory } from "@/lib/groupByCategory";
import { dayProgress } from "@/lib/planText";
import type { TaskView } from "@/types/plan";
import { CategoryRing } from "./CategoryRing";
import { TaskRow } from "./TaskRow";

/**
 * Alle Aufgaben eines Tages in klappbaren Gruppen nach Kategorie. Im Kopf jeder
 * Gruppe steht der Fortschritt als Ring, in dem auch meine Zeitfenster zu sehen
 * sind (CategoryRing); fertige Gruppen starten zugeklappt.
 */
export function TaskGroupList({
  tasks,
  onSelect,
}: {
  tasks: TaskView[];
  onSelect: (taskId: string, slotId: string | null) => void;
}) {
  // Anders als im Profil kommen und gehen Kategorien je nach Tag, und eine
  // Gruppe darf sich von selbst schließen, sobald alles erledigt ist. Deshalb
  // gibt es einen Standard (abhängig von den Daten); nur was man selbst
  // umgeschaltet hat, wird gemerkt, auch über Seitenwechsel hinweg.
  const openState = useOpenState("dashboard-categories");
  const me = useMe();

  if (tasks.length === 0) {
    return (
      <p className="m-2 text-center text-secondary text-subtle">
        Keine Aufgaben vorhanden.
      </p>
    );
  }

  return (
    // Oben kein Rand: den liefert schon der Wrapper der Seite
    <div className="mx-2 mt-0 mb-2 flex flex-col gap-2">
      {groupByCategory(tasks).map(({ category, items }) => {
        const { done, total } = dayProgress(items);
        // Fertige Gruppen starten zu – und klappen auch von selbst zu, sobald
        // das Letzte erledigt ist
        const key = categoryKey(category);
        const open = openState.isOpen(key, !(total > 0 && done === total));

        return (
          <CategoryGroup
            key={key}
            info={{
              name: category.name,
              tone: category.tone,
              icon: category.icon,
              items,
            }}
            open={open}
            onToggle={() => openState.set(key, !open)}
            meta={
              <CategoryRing
                slots={items.flatMap((task) => task.slots)}
                done={done}
                total={total}
                me={me}
              />
            }
          >
            <div className="flex flex-col py-1">
              {items.map((task) => (
                <TaskRow
                  key={task.taskId}
                  task={task}
                  tone={category.tone}
                  onSelect={(slotId) => onSelect(task.taskId, slotId)}
                />
              ))}
            </div>
          </CategoryGroup>
        );
      })}
    </div>
  );
}
