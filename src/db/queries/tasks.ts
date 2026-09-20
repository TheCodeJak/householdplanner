import { eq, and, inArray } from "drizzle-orm";
import { db } from "..";
import { task, taskSlot } from "../schema";

export async function getTasksByFamily(familyId: string) {
  const tasks = await db
    .select()
    .from(task)
    .where(and(eq(task.familyId, familyId), eq(task.isActive, true)))
    .orderBy(task.category, task.title);

  const taskIds = tasks.map((t) => t.id);

  const allSlots =
    taskIds.length > 0
      ? await db
          .select()
          .from(taskSlot)
          .where(inArray(taskSlot.taskId, taskIds))
          .orderBy(taskSlot.sortOrder)
      : [];

  const slotsByTask = new Map<string, (typeof allSlots)[number][]>();
  for (const s of allSlots) {
    const arr = slotsByTask.get(s.taskId) ?? [];
    arr.push(s);
    slotsByTask.set(s.taskId, arr);
  }

  return tasks.map((t) => ({
    ...t,
    slots: slotsByTask.get(t.id) ?? [],
  }));
}

export async function createTask(data: {
  familyId: string;
  createdById: string;
  title: string;
  description?: string;
  category?: string;
  slots?: string[];
}) {
  const { slots: slotLabels, ...taskData } = data;
  const [newTask] = await db.insert(task).values(taskData).returning();

  if (slotLabels && slotLabels.length > 0) {
    await db.insert(taskSlot).values(
      slotLabels.map((label, i) => ({
        taskId: newTask.id,
        label,
        sortOrder: i,
      })),
    );
  }

  return newTask;
}
