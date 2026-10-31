import {
  isTaskIconName,
  isTaskIconTone,
  type TaskIconName,
} from "@/lib/taskIcons";
import type { CategoryOption } from "@/types/profile";
import { and, asc, count, eq, sql } from "drizzle-orm";
import { db } from "..";
import { category, task } from "../schema";

/** Mehr Kategorien pro Familie gibt es nicht (gegen Spam und endlose Listen) */
export const MAX_CATEGORIES_PER_FAMILY = 30;

type CategoryFields = Pick<CategoryOption, "name" | "tone" | "icon">;

// Ton und Icon stehen als Text in der DB; ein unbekannter Wert fällt auf Grau
// bzw. "kein Icon" zurück
const toOption = (
  row: { id: string; name: string; tone: string; icon: string | null },
  taskCount: number,
): CategoryOption => ({
  id: row.id,
  name: row.name,
  tone: isTaskIconTone(row.tone) ? row.tone : "slate",
  icon: row.icon && isTaskIconName(row.icon) ? row.icon : null,
  taskCount,
});

// Eindeutigkeitsverletzung (Postgres 23505). Je nach Treiber steckt der Code
// direkt im Fehler oder in `cause`.
function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } };
  return (e?.code ?? e?.cause?.code) === "23505";
}

/** Alle Kategorien der Familie in der Reihenfolge der Anzeige, mit Zahl der Aufgaben */
export async function getCategories({
  familyId,
}: {
  familyId: string;
}): Promise<CategoryOption[]> {
  const rows = await db
    .select({
      id: category.id,
      name: category.name,
      tone: category.tone,
      icon: category.icon,
      taskCount: count(task.id),
    })
    .from(category)
    .leftJoin(task, eq(task.categoryId, category.id))
    .where(eq(category.familyId, familyId))
    .groupBy(category.id)
    .orderBy(asc(category.sortOrder), asc(category.name));
  return rows.map((row) => toOption(row, row.taskCount));
}

export type CreateCategoryResult =
  | { ok: true; category: CategoryOption }
  | { ok: false; reason: "name_taken" | "limit" };

export async function createCategory({
  familyId,
  name,
  tone,
  icon,
}: {
  familyId: string;
  name: string;
  tone: CategoryFields["tone"];
  icon: TaskIconName | null;
}): Promise<CreateCategoryResult> {
  const [{ total, next }] = await db
    .select({
      total: count(),
      next: sql<number>`coalesce(max(${category.sortOrder}), -1) + 1`,
    })
    .from(category)
    .where(eq(category.familyId, familyId));
  if (total >= MAX_CATEGORIES_PER_FAMILY) return { ok: false, reason: "limit" };

  // Der Unique-Index (Familie + lower(name)) entscheidet, nicht eine vorherige
  // Abfrage: So können zwei gleichzeitige Anfragen keinen Namen doppelt anlegen.
  const [created] = await db
    .insert(category)
    .values({ familyId, name, tone, icon, sortOrder: next })
    .onConflictDoNothing()
    .returning({
      id: category.id,
      name: category.name,
      tone: category.tone,
      icon: category.icon,
    });
  if (!created) return { ok: false, reason: "name_taken" };

  return { ok: true, category: toOption(created, 0) };
}

export type UpdateCategoryResult =
  { ok: true } | { ok: false; reason: "not_found" | "name_taken" };

/** Name, Farbe und Icon ändern. Die Familie steckt im Filter: Fremde Kategorien gibt es "nicht". */
export async function updateCategory({
  familyId,
  id,
  name,
  tone,
  icon,
}: {
  familyId: string;
  id: string;
  name: string;
  tone: CategoryFields["tone"];
  icon: TaskIconName | null;
}): Promise<UpdateCategoryResult> {
  try {
    const rows = await db
      .update(category)
      .set({ name, tone, icon })
      .where(and(eq(category.id, id), eq(category.familyId, familyId)))
      .returning({ id: category.id });
    return rows.length > 0 ? { ok: true } : { ok: false, reason: "not_found" };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, reason: "name_taken" };
    throw error;
  }
}

/**
 * Löscht die Kategorie. Ihre Aufgaben bleiben erhalten und stehen danach in
 * "Sonstiges" (task.category_id ist "on delete set null").
 * Gibt false zurück, wenn es sie in dieser Familie nicht gibt.
 */
export async function deleteCategory({
  familyId,
  id,
}: {
  familyId: string;
  id: string;
}): Promise<boolean> {
  const rows = await db
    .delete(category)
    .where(and(eq(category.id, id), eq(category.familyId, familyId)))
    .returning({ id: category.id });
  return rows.length > 0;
}
