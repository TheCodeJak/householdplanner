import { and, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "..";
import { task, taskAssignment, taskSlot } from "../schema";

// Schreibzugriffe auf Zuweisungen (task_assignment).
// Prinzip: Regel und Änderung stehen in EINEM SQL-Statement (Bedingungen im
// WHERE, dazu .returning()). Kommt keine Zeile zurück, war eine Regel verletzt –
// der Router macht daraus einen CONFLICT. So gibt es keine Lücke zwischen
// "prüfen" und "schreiben", in der ein zweiter Request dazwischenfunken könnte.

// Eine Zuweisung ist durch Aufgabe + Tag + Slot eindeutig (Unique-Index in schema.ts)
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
