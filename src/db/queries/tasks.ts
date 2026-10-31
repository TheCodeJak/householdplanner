import { groupTaskTemplates } from "@/lib/groupTaskTemplates";
import type { TaskIconName } from "@/lib/taskIcons";
import type { TaskTemplate } from "@/types/profile";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "..";
import { category, task, taskAssignment, taskSlot } from "../schema";

/**
 * Gehört die Kategorie zu dieser Familie? Die Zeile wird bis zum Ende der
 * Transaktion gesperrt, damit sie nicht gelöscht wird, während die Aufgabe
 * darauf verweist. So kann eine Aufgabe nie an die Kategorie einer fremden
 * Familie hängen.
 */
async function categoryBelongsToFamily(
  executor: Pick<typeof db, "select">,
  categoryId: string,
  familyId: string,
): Promise<boolean> {
  const [row] = await executor
    .select({ id: category.id })
    .from(category)
    .where(and(eq(category.id, categoryId), eq(category.familyId, familyId)))
    .for("share");
  return !!row;
}

export type CreateTaskResult =
  | { ok: true; task: typeof task.$inferSelect }
  | { ok: false; reason: "unknown_category" };

export function createTask(data: {
  familyId: string;
  createdById: string;
  title: string;
  description?: string;
  /** null/fehlt = "Sonstiges" */
  categoryId?: string | null;
  icon?: TaskIconName;
  slots?: string[];
}): Promise<CreateTaskResult> {
  return db.transaction(async (tx) => {
    const { slots: slotLabels, categoryId = null, ...taskData } = data;
    if (
      categoryId &&
      !(await categoryBelongsToFamily(tx, categoryId, data.familyId))
    ) {
      return { ok: false, reason: "unknown_category" };
    }

    const [newTask] = await tx
      .insert(task)
      .values({ ...taskData, categoryId })
      .returning();

    if (slotLabels && slotLabels.length > 0) {
      await tx.insert(taskSlot).values(
        slotLabels.map((label, i) => ({
          taskId: newTask.id,
          label,
          sortOrder: i,
        })),
      );
    }

    return { ok: true, task: newTask };
  });
}

/** Alle Aufgaben-Vorlagen der Familie (auch archivierte) samt Zeitfenstern */
export async function getTaskTemplates(
  { familyId }: { familyId: string },
  // Nur für Tests in einer Transaktion; im Betrieb immer die normale Verbindung
  executor: Pick<typeof db, "select"> = db,
): Promise<TaskTemplate[]> {
  // Sortierung wie im Tagesplan: "Sonstiges" (NULL) zuletzt, Gleichstand über den Namen
  const rows = await executor
    .select({
      id: task.id,
      title: task.title,
      icon: task.icon,
      categoryId: category.id,
      categoryName: category.name,
      categoryTone: category.tone,
      categoryIcon: category.icon,
      description: task.description,
      isActive: task.isActive,
      slotId: taskSlot.id,
      slotLabel: taskSlot.label,
    })
    .from(task)
    .leftJoin(category, eq(category.id, task.categoryId))
    .leftJoin(taskSlot, eq(taskSlot.taskId, task.id))
    .where(eq(task.familyId, familyId))
    .orderBy(
      asc(category.sortOrder),
      asc(category.name),
      asc(task.title),
      asc(taskSlot.sortOrder),
    );
  return groupTaskTemplates(rows);
}

// ── Aufgabe ändern ─────────────────────────────────────────────────────────

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

type UpdateTaskData = {
  familyId: string;
  taskId: string;
  title: string;
  description: string | null;
  /** null = "Sonstiges" */
  categoryId: string | null;
  icon: TaskIconName | null;
  /** Bestehende Zeitfenster mit id, neue ohne. Die Reihenfolge ist die Sortierung. */
  slots: { id?: string; label: string }[];
};

export type UpdateTaskResult =
  | { ok: true }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "unknown_category" }
  | { ok: false; reason: "unknown_slot" }
  | { ok: false; reason: "slot_in_use"; label: string };

export function updateTask(data: UpdateTaskData): Promise<UpdateTaskResult> {
  return db.transaction((tx) => applyTaskUpdate(tx, data));
}

/**
 * Die Änderung selbst, getrennt von der Transaktion (so lässt sie sich in einer
 * zurückgerollten Transaktion testen).
 *
 * Zeitfenster werden nach ihrer id abgeglichen, NICHT gelöscht und neu
 * angelegt: `task_assignment.slot_id` ist "on delete set null", bestehende
 * Zuweisungen würden sonst ihren Slot verlieren. Ein Zeitfenster, das schon
 * Einträge im Verlauf hat, darf deshalb nicht entfernt werden. Beim Löschen
 * würden mehrere Zuweisungen desselben Tages auf slot_id NULL gesetzt und
 * `unique_slot_per_day` verletzen.
 */
export async function applyTaskUpdate(
  tx: Tx,
  {
    familyId,
    taskId,
    title,
    description,
    categoryId,
    icon,
    slots,
  }: UpdateTaskData,
): Promise<UpdateTaskResult> {
  // Die Familie steckt im Filter: Fremde Aufgaben sind "nicht gefunden". Die
  // Zeile wird gesperrt, damit zwei gleichzeitige Änderungen nacheinander laufen.
  const [existing] = await tx
    .select({ id: task.id })
    .from(task)
    .where(and(eq(task.id, taskId), eq(task.familyId, familyId)))
    .for("update");
  if (!existing) return { ok: false, reason: "not_found" };

  if (
    categoryId &&
    !(await categoryBelongsToFamily(tx, categoryId, familyId))
  ) {
    return { ok: false, reason: "unknown_category" };
  }

  const current = await tx
    .select({ id: taskSlot.id, label: taskSlot.label })
    .from(taskSlot)
    .where(eq(taskSlot.taskId, taskId));
  const currentIds = new Set(current.map((s) => s.id));

  // Jede mitgeschickte id muss zu dieser Aufgabe gehören und nur einmal vorkommen
  const keptIds = new Set<string>();
  for (const slot of slots) {
    if (!slot.id) continue;
    if (!currentIds.has(slot.id) || keptIds.has(slot.id)) {
      return { ok: false, reason: "unknown_slot" };
    }
    keptIds.add(slot.id);
  }

  const removed = current.filter((s) => !keptIds.has(s.id));
  if (removed.length > 0) {
    const used = await tx
      .selectDistinct({ slotId: taskAssignment.slotId })
      .from(taskAssignment)
      .where(
        inArray(
          taskAssignment.slotId,
          removed.map((s) => s.id),
        ),
      );
    const blocked = removed.find((s) => used.some((u) => u.slotId === s.id));
    if (blocked)
      return { ok: false, reason: "slot_in_use", label: blocked.label };
  }

  await tx
    .update(task)
    .set({ title, description, categoryId, icon })
    .where(eq(task.id, taskId));

  for (const [i, slot] of slots.entries()) {
    if (slot.id) {
      await tx
        .update(taskSlot)
        .set({ label: slot.label, sortOrder: i })
        .where(eq(taskSlot.id, slot.id));
    } else {
      await tx
        .insert(taskSlot)
        .values({ taskId, label: slot.label, sortOrder: i });
    }
  }

  if (removed.length > 0) {
    await tx.delete(taskSlot).where(
      inArray(
        taskSlot.id,
        removed.map((s) => s.id),
      ),
    );
  }

  return { ok: true };
}

/** Archiviert (false) oder holt zurück (true). Gibt false zurück, wenn es die Aufgabe in dieser Familie nicht gibt. */
export async function setTaskActive(
  {
    familyId,
    taskId,
    isActive,
  }: {
    familyId: string;
    taskId: string;
    isActive: boolean;
  },
  executor: Pick<typeof db, "update"> = db,
): Promise<boolean> {
  const rows = await executor
    .update(task)
    .set({ isActive })
    .where(and(eq(task.id, taskId), eq(task.familyId, familyId)))
    .returning({ id: task.id });
  return rows.length > 0;
}
