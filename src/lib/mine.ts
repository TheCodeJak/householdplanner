// Reine Funktionen für den Filter „Meine“ (kein React, kein Server).

import type { SlotView, TaskView } from "@/types/plan";

/** „Meins“ = der Slot ist mir zugewiesen (übernommen oder von mir erledigt) */
export const isMine = (slot: SlotView) => !!slot.assignee?.isCurrentUser;

/** Nur meine Slots; Aufgaben ohne einen eigenen Slot fallen ganz heraus */
export function onlyMine(tasks: TaskView[]): TaskView[] {
  return tasks
    .map((task) => ({ ...task, slots: task.slots.filter(isMine) }))
    .filter((task) => task.slots.length > 0);
}

export function countMine(tasks: TaskView[]): number {
  return tasks.reduce((sum, task) => sum + task.slots.filter(isMine).length, 0);
}
