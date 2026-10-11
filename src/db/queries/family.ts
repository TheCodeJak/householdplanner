import { eq } from "drizzle-orm";
import { db } from "..";
import { user } from "../schema";

export async function getUserFamily(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ familyId: user.familyId })
    .from(user)
    .where(eq(user.id, userId));
  return row?.familyId ?? null;
}

export async function getMembers(familyId: string): Promise<string[]> {
  const rows = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.familyId, familyId));
  return rows.map((row) => row.name);
}
