"use client";

// ⚠️ TEMPORÄR: Ersetzt im Dashboard die TaskCardList, solange die
// Gruppierungs-Varianten getestet werden. Ohne Parameter = TaskCardList wie
// bisher. Zum Aufräumen: in dashboard/page.tsx wieder <TaskCardList> nutzen
// und diesen Ordner löschen.

import { TaskCardList } from "@/components/dashboard/TaskCardList";
import type { TaskView } from "@/types/plan";
import { useSearchParams } from "next/navigation";
import { GroupedTasks } from "./GroupedTasks";
import { parseVariants } from "./variantConfig";
import { VariantSwitcher } from "./VariantSwitcher";

export function DashboardVariants({
  tasks,
  onSelect,
}: {
  tasks: TaskView[];
  onSelect: (taskId: string, slotId: string | null) => void;
}) {
  const choice = parseVariants(useSearchParams());

  return (
    <>
      {choice.g === 1 || tasks.length === 0 ? (
        <TaskCardList tasks={tasks} onSelect={onSelect} />
      ) : (
        <GroupedTasks tasks={tasks} choice={choice} onSelect={onSelect} />
      )}
      <VariantSwitcher active={choice} />
    </>
  );
}
