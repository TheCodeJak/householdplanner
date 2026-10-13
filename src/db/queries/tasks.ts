import type { TaskIconName } from "@/lib/taskIcons";
import { eq } from "drizzle-orm";
import { db } from "..";
import { task, taskSlot } from "../schema";

export async function createTask(data: {
  familyId: string;
  createdById: string;
  title: string;
  description?: string;
  category?: string;
  icon?: TaskIconName;
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

export async function getTasks({ familyId }: { familyId: string }) {
  return await db.select().from(task).where(eq(task.familyId, familyId));
}
