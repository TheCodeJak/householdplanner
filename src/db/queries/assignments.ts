import { and, eq, gte, isNull, lte, sql } from "drizzle-orm";
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

export async function getAssignmentsForWeek(
  mondayDate: string,
  familyId: string,
) {
  const [y, m, d] = mondayDate.split("-").map(Number);
  const sunday = new Date(y, m - 1, d + 6);
  const sundayDate = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, "0")}-${String(sunday.getDate()).padStart(2, "0")}`;

  return await db
    .select({
      assignmentId: taskAssignment.id,
      taskId: taskAssignment.taskId,
      slotId: taskAssignment.slotId,
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

export async function findAssignment(
  taskId: string,
  date: string,
  slotId?: string | null,
) {
  const conditions = [
    eq(taskAssignment.taskId, taskId),
    eq(taskAssignment.date, date),
  ];
  if (slotId) {
    conditions.push(eq(taskAssignment.slotId, slotId));
  } else {
    conditions.push(isNull(taskAssignment.slotId));
  }

  const [row] = await db
    .select()
    .from(taskAssignment)
    .where(and(...conditions))
    .limit(1);
  return row ?? null;
}

export async function findSlot(slotId: string) {
  const conditions = [];
  if (slotId) {
    conditions.push(eq(taskAssignment.slotId, slotId));
  } else {
    conditions.push(isNull(taskAssignment.slotId));
  }

  const [row] = await db
    .select()
    .from(taskAssignment)
    .where(and(...conditions))
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
  slotId?: string | null;
}) {
  const [assignment] = await db.insert(taskAssignment).values(data).returning();
  return assignment;
}

export async function deleteAssignment(assignmentId: string) {
  await db.delete(taskAssignment).where(eq(taskAssignment.id, assignmentId));
}

// ================================================
// ====================NEU=========================
// ================================================

// const queryCondition = (data: {
//   taskId: string;
//   slotId?: string | null;
//   date: string;
// }) => {

// }

export async function resolveAssignment(data: {
  taskId: string;
  slotId?: string | null;
  assignedToId: string;
  completedById?: string | null;
  date: string;
}) {
  const [assignment] = await db.insert(taskAssignment).values(data).returning();
  return assignment;
}

export async function completeAssignmentv2(data: {
  taskId: string;
  slotId?: string | null;
  completedById: string;
  date: string;
}) {
  const [assignment] = await db
    .update(taskAssignment)
    .set({
      completedById: data.completedById,
    })
    .where(
      and(
        eq(taskAssignment.taskId, data.taskId),
        eq(taskAssignment.date, data.date),
        data.slotId
          ? eq(taskAssignment.slotId, data.slotId)
          : isNull(taskAssignment.slotId),
      ),
    )
    .returning();
  return assignment;
}

export async function deleteAssignmentv2(data: {
  taskId: string;
  slotId?: string | null;
  date: string;
}) {
  await db
    .delete(taskAssignment)
    .where(
      and(
        eq(taskAssignment.taskId, data.taskId),
        eq(taskAssignment.date, data.date),
        data.slotId
          ? eq(taskAssignment.slotId, data.slotId)
          : isNull(taskAssignment.slotId),
      ),
    );
}

export async function uncompleteAssignmentv2(
  taskId: string,
  slotId: string | null,
  date: string,
) {
  const [assignment] = await db
    .update(taskAssignment)
    .set({
      completedById: null,
      completedAt: null,
    })
    .where(
      and(
        eq(taskAssignment.taskId, taskId),
        eq(taskAssignment.date, date),
        slotId
          ? eq(taskAssignment.slotId, slotId)
          : isNull(taskAssignment.slotId),
      ),
    )
    .returning();
  return assignment;
}

export async function getCompletedUser(
  taskId: string,
  slotId: string | null,
  date: string,
) {
  const [completer] = await db
    .select()
    .from(taskAssignment)
    .where(
      and(
        eq(taskAssignment.taskId, taskId),
        eq(taskAssignment.date, date),
        slotId
          ? eq(taskAssignment.slotId, slotId)
          : isNull(taskAssignment.slotId),
      ),
    );
  return completer?.completedById ?? null;
}

export async function isAssignmentCompleted(
  taskId: string,
  slotId: string | null,
  date: string,
) {
  const [assignment] = await db
    .select()
    .from(taskAssignment)
    .where(
      and(
        eq(taskAssignment.taskId, taskId),
        eq(taskAssignment.date, date),
        slotId
          ? eq(taskAssignment.slotId, slotId)
          : isNull(taskAssignment.slotId),
      ),
    );
  return assignment?.completedAt !== null;
}
