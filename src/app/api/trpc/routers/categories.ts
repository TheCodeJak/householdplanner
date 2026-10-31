import {
  createCategory,
  deleteCategory,
  getCategories,
  MAX_CATEGORIES_PER_FAMILY,
  updateCategory,
} from "@/db/queries/categories";
import { categoryNameProblem } from "@/lib/categories";
import { TASK_ICON_NAMES, TASK_TONE_NAMES } from "@/lib/taskIcons";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { familyProcedure, router } from "../init";

// Die Familie kommt immer aus der Session (ctx.familyId), nie vom Client.
// Der Ton ist einer der festen Namen aus taskIcons.ts, keine freie Farbe (so
// landet nie ein beliebiger Text in einem style-Attribut).
const name = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    const problem = categoryNameProblem(value);
    if (problem) ctx.addIssue({ code: "custom", message: problem });
  });
const tone = z.enum(TASK_TONE_NAMES);
// Eigenes Icon der Kategorie; null = das der ersten Aufgabe zeigen
const icon = z.enum(TASK_ICON_NAMES).nullable();

export const categoriesRouter = router({
  /** Alle Kategorien der Familie, auch leere, mit Zahl der Aufgaben */
  list: familyProcedure.query(({ ctx }) =>
    getCategories({ familyId: ctx.familyId }),
  ),

  create: familyProcedure
    .input(z.object({ name, tone, icon }))
    .mutation(async ({ input, ctx }) => {
      const result = await createCategory({
        ...input,
        familyId: ctx.familyId,
      });
      if (!result.ok) {
        throw result.reason === "limit"
          ? new TRPCError({
              code: "BAD_REQUEST",
              message: `Mehr als ${MAX_CATEGORIES_PER_FAMILY} Kategorien sind nicht möglich.`,
            })
          : nameTaken();
      }
      return result.category;
    }),

  update: familyProcedure
    .input(z.object({ id: z.uuid(), name, tone, icon }))
    .mutation(async ({ input, ctx }) => {
      const result = await updateCategory({ ...input, familyId: ctx.familyId });
      if (!result.ok) {
        throw result.reason === "not_found" ? notFound() : nameTaken();
      }
    }),

  /** Die Aufgaben der Kategorie bleiben erhalten und stehen danach in "Sonstiges" */
  delete: familyProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ input, ctx }) => {
      const found = await deleteCategory({ ...input, familyId: ctx.familyId });
      if (!found) throw notFound();
    }),
});

// Die Meldungen sind für Nutzer gedacht (siehe describeError) und werden angezeigt
function notFound() {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "Kategorie nicht gefunden. Lade die Seite neu.",
  });
}

function nameTaken() {
  return new TRPCError({
    code: "CONFLICT",
    message: "Eine Kategorie mit diesem Namen gibt es schon.",
  });
}
