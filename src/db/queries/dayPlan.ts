import { and, asc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "..";
import { category, task, taskAssignment, taskSlot, user } from "../schema";

const assignedUser = alias(user, "assignedUser");
const completedUser = alias(user, "completedUser");

export async function getDayPlanRows(
  {
    familyId,
    date,
  }: {
    familyId: string;
    date: string;
  },
  // Nur für Tests in einer Transaktion; im Betrieb immer die normale Verbindung
  executor: Pick<typeof db, "select"> = db,
) {
  // Sortierung: Aufgaben ohne Kategorie ("Sonstiges") zuletzt (NULL steht bei ASC
  // hinten); category.name löst Gleichstand bei sort_order auf, damit die
  // Reihenfolge der Gruppen feststeht.
  return executor
    .select({
      taskId: task.id,
      title: task.title,
      icon: task.icon,
      categoryId: category.id,
      categoryName: category.name,
      categoryTone: category.tone,
      categoryIcon: category.icon,
      slotId: taskSlot.id,
      slotLabel: taskSlot.label,
      assignmentId: taskAssignment.id,
      notes: taskAssignment.notes,
      completedAt: taskAssignment.completedAt,
      assignedToId: taskAssignment.assignedToId,
      assigneeName: assignedUser.name,
      assigneeColor: assignedUser.color,
      completedById: taskAssignment.completedById,
      completedByName: completedUser.name,
      completedByColor: completedUser.color,
    })
    .from(task)
    .leftJoin(taskSlot, eq(taskSlot.taskId, task.id))
    .leftJoin(category, eq(category.id, task.categoryId))
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
    .orderBy(
      asc(category.sortOrder),
      asc(category.name),
      asc(task.title),
      asc(taskSlot.sortOrder),
    );
}
