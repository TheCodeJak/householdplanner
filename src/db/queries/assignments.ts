import {
  and,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  lte,
  sql,
} from "drizzle-orm";
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

type SlotKey = { taskId: string; slotId?: string | null; date: string };

const slotMatch = (key: SlotKey) =>
  and(
    eq(taskAssignment.taskId, key.taskId),
    eq(taskAssignment.date, key.date),
    key.slotId
      ? eq(taskAssignment.slotId, key.slotId)
      : isNull(taskAssignment.slotId),
  );

const taskIdsOfFamily = (familyId: string) =>
  db.select({ id: task.id }).from(task).where(eq(task.familyId, familyId));

export async function slotBelongsToFamily(
  familyId: string,
  key: SlotKey,
): Promise<boolean> {
  const [found] = await db
    .select({ id: task.id })
    .from(task)
    .where(
      and(
        eq(task.id, key.taskId),
        eq(task.familyId, familyId),
        eq(task.isActive, true),
      ),
    );
  if (!found) return false;

  const slots = await db
    .select({ id: taskSlot.id })
    .from(taskSlot)
    .where(eq(taskSlot.taskId, key.taskId));

  return key.slotId
    ? slots.some((s) => s.id === key.slotId)
    : slots.length === 0;
}

export async function claimSlot(
  data: SlotKey & { userId: string; alsoComplete?: boolean },
) {
  const [row] = await db
    .insert(taskAssignment)
    .values({
      taskId: data.taskId,
      slotId: data.slotId ?? null,
      date: data.date,
      assignedToId: data.userId,
      ...(data.alsoComplete
        ? { completedById: data.userId, completedAt: sql`now()` }
        : {}),
    })
    .onConflictDoNothing()
    .returning();
  return row ?? null;
}

export async function releaseSlot(
  data: SlotKey & { familyId: string; userId: string },
) {
  const [row] = await db
    .delete(taskAssignment)
    .where(
      and(
        slotMatch(data),
        eq(taskAssignment.assignedToId, data.userId),
        isNull(taskAssignment.completedAt),
        inArray(taskAssignment.taskId, taskIdsOfFamily(data.familyId)),
      ),
    )
    .returning();
  return row ?? null;
}

export async function completeSlot(
  data: SlotKey & { familyId: string; userId: string },
) {
  const [row] = await db
    .update(taskAssignment)
    .set({ completedById: data.userId, completedAt: sql`now()` })
    .where(
      and(
        slotMatch(data),
        isNull(taskAssignment.completedAt),
        inArray(taskAssignment.taskId, taskIdsOfFamily(data.familyId)),
      ),
    )
    .returning();
  return row ?? null;
}

export async function reopenSlot(
  data: SlotKey & { familyId: string; userId: string },
) {
  const [row] = await db
    .update(taskAssignment)
    .set({ completedById: null, completedAt: null })
    .where(
      and(
        slotMatch(data),
        eq(taskAssignment.completedById, data.userId),
        isNotNull(taskAssignment.completedAt),
        inArray(taskAssignment.taskId, taskIdsOfFamily(data.familyId)),
      ),
    )
    .returning();
  return row ?? null;
}
