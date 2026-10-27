"use client";

import { CategoryGroup } from "@/components/ui/CategoryGroup";
import { groupByCategory } from "@/lib/groupByCategory";
import { dayProgress } from "@/lib/planText";
import { useOpenState } from "@/hooks/useOpenState";
import type { TaskView } from "@/types/plan";
import { TaskRow } from "./TaskRow";

/**
 * Alle Aufgaben eines Tages in farbigen, klappbaren Gruppen nach Kategorie.
 * Im Kopf jeder Gruppe steht der Fortschritt als Balken; fertige Gruppen
 * starten zugeklappt.
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

  if (tasks.length === 0) {
    return (
      <p className="m-2 text-center text-secondary text-subtle">
        Keine Aufgaben vorhanden.
      </p>
    );
  }

  return (
    <div className="m-2 flex flex-col gap-2">
      {groupByCategory(tasks).map(({ category, items }) => {
        const { done, total } = dayProgress(items);
        // Fertige Gruppen starten zu – und klappen auch von selbst zu, sobald
        // das Letzte erledigt ist
        const open = openState.isOpen(category, !(total > 0 && done === total));

        return (
          <CategoryGroup
            key={category}
            info={{ name: category, items }}
            open={open}
            onToggle={() => openState.set(category, !open)}
            meta={<GroupProgress done={done} total={total} />}
          >
            <div className="flex flex-col py-1">
              {items.map((task) => (
                <TaskRow
                  key={task.taskId}
                  task={task}
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

/** Fortschritt im Gruppenkopf: Balken plus "2/3" */
function GroupProgress({ done, total }: { done: number; total: number }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-surface/70 dark:bg-white/10">
        <span
          className="block h-full rounded-full bg-success-600 transition-[width] duration-500"
          style={{ width: `${total ? (done / total) * 100 : 0}%` }}
        />
      </span>
      {/* fg-2 statt muted: auf dem getönten Gruppenkopf reicht muted dunkel nicht für 4,5:1 */}
      <span className="text-caption font-semibold text-fg-2 tabular-nums">
        {done}/{total}
      </span>
    </span>
  );
}
