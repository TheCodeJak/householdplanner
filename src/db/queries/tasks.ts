import { eq, and } from "drizzle-orm";
import { db } from "..";
import { task } from "../schema";

export async function getTasksByFamily(familyId: string) {
  return db
    .select()
    .from(task)
    .where(and(eq(task.familyId, familyId), eq(task.isActive, true)))
    .orderBy(task.category, task.title);
}

export async function createTask(data: {
  familyId: string;
  createdById: string;
  title: string;
  description?: string;
  category?: string;
}) {
  const [newTask] = await db.insert(task).values(data).returning();
  return newTask;
}
