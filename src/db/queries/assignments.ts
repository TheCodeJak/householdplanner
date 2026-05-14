import { eq, and, gte, lte, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "..";
import { task, taskAssignment, taskSlot, user } from "../schema";

const assignedUser = alias(user, "assignedUser");
const completedUser = alias(user, "completedUser");

export async function getAssignmentForDate(date: string, familyId: string) {
  return await db
    .select({
      assignmentId: taskAssignment.id,
      date: taskAssignment.date,
      completedAt: taskAssignment.completedAt,
      notes: taskAssignment.notes,
      taskId: task.id,
      taskTitle: task.title,
      taskCategory: task.category,
      slotId: taskSlot.id,
      slotLabel: taskSlot.label,
      slotSortOrder: taskSlot.sortOrder,
      assignedTo: assignedUser.name,
      completedBy: completedUser.name,
    })
    .from(taskAssignment)
    .innerJoin(task, eq(task.id, taskAssignment.taskId))
    .leftJoin(taskSlot, eq(taskSlot.id, taskAssignment.slotId))
    .innerJoin(assignedUser, eq(assignedUser.id, taskAssignment.assignedToId))
    .leftJoin(completedUser, eq(completedUser.id, taskAssignment.completedById))
    .where(and(eq(taskAssignment.date, date), eq(task.familyId, familyId)))
    .orderBy(task.category, task.title, taskSlot.sortOrder);
}

export async function getAssignmentsForWeek(mondayDate: string, familyId: string) {
  const [y, m, d] = mondayDate.split("-").map(Number);
  const sunday = new Date(y, m - 1, d + 6);
  const sundayDate = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, "0")}-${String(sunday.getDate()).padStart(2, "0")}`;

  return await db
    .select({
      assignmentId: taskAssignment.id,
      taskId: taskAssignment.taskId,
      date: taskAssignment.date,
      assignedToId: taskAssignment.assignedToId,
      assigneeName: assignedUser.name,
      completedById: taskAssignment.completedById,
      completedByName: completedUser.name,
      completedAt: taskAssignment.completedAt,
      notes: taskAssignment.notes,
    })
    .from(taskAssignment)
    .innerJoin(task, eq(task.id, taskAssignment.taskId))
    .innerJoin(assignedUser, eq(assignedUser.id, taskAssignment.assignedToId))
    .leftJoin(completedUser, eq(completedUser.id, taskAssignment.completedById))
    .where(
      and(
        gte(taskAssignment.date, mondayDate),
        lte(taskAssignment.date, sundayDate),
        eq(task.familyId, familyId),
      ),
    );
}

export async function findAssignment(taskId: string, date: string) {
  const [row] = await db
    .select()
    .from(taskAssignment)
    .where(and(eq(taskAssignment.taskId, taskId), eq(taskAssignment.date, date)))
    .limit(1);
  return row ?? null;
}

export async function completeAssignment(assignmentId: string, userId: string) {
  const [row] = await db
    .update(taskAssignment)
    .set({ completedById: userId, completedAt: sql`now()` })
    .where(eq(taskAssignment.id, assignmentId))
    .returning();
  return row;
}

export async function uncompleteAssignment(assignmentId: string) {
  const [row] = await db
    .update(taskAssignment)
    .set({ completedById: null, completedAt: null })
    .where(eq(taskAssignment.id, assignmentId))
    .returning();
  return row;
}

export async function createAssignment(data: {
  taskId: string;
  assignedToId: string;
  date: string;
}) {
  const [assignment] = await db.insert(taskAssignment).values(data).returning();
  return assignment;
}

export async function deleteAssignment(assignmentId: string) {
  await db.delete(taskAssignment).where(eq(taskAssignment.id, assignmentId));
}
