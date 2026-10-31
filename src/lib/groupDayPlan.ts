import { Person, SlotView, TaskView } from "@/types/plan";
import { categoryFromRow } from "./categories";
import { personColor } from "./color";
import { isTaskIconName } from "./taskIcons";

type DayPlanRows = {
  taskId: string;
  title: string;
  icon: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryTone: string | null;
  categoryIcon: string | null;
  slotId: string | null;
  slotLabel: string | null;
  assignmentId: string | null;
  notes: string | null;
  completedAt: Date | null;
  assignedToId: string | null;
  assigneeName: string | null;
  assigneeColor: string | null;
  completedById: string | null;
  completedByName: string | null;
  completedByColor: string | null;
}[];

export function groupDayPlan({
  rows,
  currentUserId,
}: {
  rows: DayPlanRows;
  currentUserId: string;
}): TaskView[] {
  const tasks = new Map<string, TaskView>();

  rows.forEach((row) => {
    const assignee: Person | null = row.assignedToId
      ? {
          id: row.assignedToId,
          name: row.assigneeName ?? "",
          color: row.assigneeColor ?? personColor(0),
          isCurrentUser: row.assignedToId === currentUserId,
        }
      : null;
    const completer: Person | null = row.completedById
      ? {
          id: row.completedById,
          name: row.completedByName ?? "",
          color: row.completedByColor ?? personColor(0),
          isCurrentUser: row.completedById === currentUserId,
        }
      : null;

    const slot: SlotView[] = [
      {
        slotId: row.slotId,
        label: row.slotLabel,
        status: row.completedAt
          ? "completed"
          : row.assignedToId
            ? "claimed"
            : "open",
        assignmentId: row.assignmentId,
        assignee: assignee,
        completedBy: completer,
        notes: row.notes,
      },
    ];

    const alreadyExistingTask = tasks.get(row.taskId);
    if (alreadyExistingTask) {
      alreadyExistingTask.slots = [...alreadyExistingTask.slots, ...slot];
    } else {
      tasks.set(row.taskId, {
        taskId: row.taskId,
        title: row.title,
        icon: row.icon && isTaskIconName(row.icon) ? row.icon : null,
        category: categoryFromRow(row),
        slots: slot,
      });
    }
  });
  return [...tasks.values()];
}
