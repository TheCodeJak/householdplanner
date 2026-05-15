import { trpc } from "@/lib/trpc";
import { colorFromUserId } from "@/lib/color";
import { getMonday, toIsoDate } from "@/lib/dateUtils";
import type { Row } from "@/types/plan";
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

  const assignmentMap = new Map(
    (assignments ?? []).map((a) => [`${a.taskId}_${a.date}`, a]),
  );

  const rows: Row[] = (tasks ?? []).map((task) => ({
    id: task.id,
    name: task.title,
    cells: weekDays.map((day) => {
      const a = assignmentMap.get(`${task.id}_${toIsoDate(day)}`);
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
