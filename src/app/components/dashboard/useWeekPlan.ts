import { trpc } from "@/lib/trpc";
import { colorFromUserId } from "@/lib/color";
import { getMonday, toIsoDate } from "@/lib/dateUtils";
import type { Row, AssignmentData } from "@/types/plan";
import { useSession } from "next-auth/react";

export const FAMILY_ID = "65183ae8-fc81-4228-97c5-dd3dd99c6322";

export function useWeekPlan(weekOffset: number) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? null;

  const monday = getMonday(weekOffset);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const { data: tasks } = trpc.tasks.getByFamily.useQuery({
    familyId: FAMILY_ID,
  });
  const { data: assignments } = trpc.assignments.getForWeek.useQuery({
    mondayDate: toIsoDate(monday),
    familyId: FAMILY_ID,
  });

  const utils = trpc.useUtils();

  const assignMutation = trpc.assignments.assign.useMutation({
    onSuccess: () => utils.assignments.getForWeek.invalidate(),
    onError: (err) => alert(err.message),
  });
  const unassignMutation = trpc.assignments.unassign.useMutation({
    onSuccess: () => utils.assignments.getForWeek.invalidate(),
  });
  const completeMutation = trpc.assignments.complete.useMutation({
    onSuccess: () => utils.assignments.getForWeek.invalidate(),
  });
  const uncompleteMutation = trpc.assignments.uncomplete.useMutation({
    onSuccess: () => utils.assignments.getForWeek.invalidate(),
  });

  // Key: "taskId_slotId_date"
  const assignmentMap = new Map(
    (assignments ?? []).map((a) => [
      `${a.taskId}_${a.slotId ?? "null"}_${a.date}`,
      a,
    ]),
  );

  function buildAssignment(
    taskId: string,
    slotId: string | null,
    day: Date,
  ): AssignmentData | null {
    const key = `${taskId}_${slotId ?? "null"}_${toIsoDate(day)}`;
    const a = assignmentMap.get(key);
    if (!a) return null;
    const isCompleted = a.completedAt !== null;
    const completerDiffers =
      isCompleted &&
      a.completedById !== null &&
      a.completedById !== a.assignedToId;
    return {
      assignmentId: a.assignmentId,
      assigneeName: a.assigneeName,
      assigneeColor: colorFromUserId(a.assignedToId),
      assignedToId: a.assignedToId,
      isCompleted,
      isCurrentUser: a.assignedToId === currentUserId,
      completedByName: a.completedByName ?? null,
      completedByColor: a.completedById
        ? colorFromUserId(a.completedById)
        : null,
      isCompletedByCurrentUser:
        a.completedById !== null && a.completedById === currentUserId,
      completerDiffers,
      note: a.notes,
    };
  }

  const rows: Row[] = (tasks ?? []).map((task) => ({
    id: task.id,
    name: task.title,
    cells: weekDays.map((day) => {
      if (task.slots.length === 0) {
        return [{ slotId: null, label: null, data: buildAssignment(task.id, null, day) }];
      }
      return task.slots.map((slot) => ({
        slotId: slot.id,
        label: slot.label,
        data: buildAssignment(task.id, slot.id, day),
      }));
    }),
  }));

  return {
    monday,
    weekDays,
    rows,
    assignMutation,
    unassignMutation,
    completeMutation,
    uncompleteMutation,
  };
}
