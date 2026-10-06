import { and, asc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "..";
import { task, taskAssignment, taskSlot, user } from "../schema";

const assignedUser = alias(user, "assignedUser");
const completedUser = alias(user, "completedUser");

export async function getDayPlanRows({
  familyId,
  date,
}: {
  familyId: string;
  date: string;
}) {
  return db
    .select({
      taskId: task.id,
      title: task.title,
      slotId: taskSlot.id,
      slotLabel: taskSlot.label,
      assignmentId: taskAssignment.id,
      notes: taskAssignment.notes,
      completedAt: taskAssignment.completedAt,
      assignedToId: taskAssignment.assignedToId,
      assigneeName: assignedUser.name,
      completedById: taskAssignment.completedById,
      completedByName: completedUser.name,
    })
    .from(task)
    .leftJoin(taskSlot, eq(taskSlot.taskId, task.id))
    .leftJoin(
      taskAssignment,
      and(
        eq(taskAssignment.taskId, task.id),
        eq(taskAssignment.date, date),
        sql`${taskAssignment.slotId} IS NOT DISTINCT FROM ${taskSlot.id}`,
      ),
    )
    .leftJoin(assignedUser, eq(assignedUser.id, taskAssignment.assignedToId))
    .leftJoin(completedUser, eq(completedUser.id, taskAssignment.completedById))
    .where(and(eq(task.familyId, familyId), eq(task.isActive, true)))
    .orderBy(asc(task.category), asc(task.title), asc(taskSlot.sortOrder));
}
