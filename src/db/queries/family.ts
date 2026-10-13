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
