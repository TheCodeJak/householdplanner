import { db } from "..";
import { task, taskSlot } from "../schema";
import type { TaskIconName } from "@/lib/taskIcons";

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
