import {
  createTask,
  getTaskTemplates,
  setTaskActive,
  updateTask,
  type UpdateTaskResult,
} from "@/db/queries/tasks";
import { TASK_ICON_NAMES } from "@/lib/taskIcons";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { familyProcedure, router } from "../init";

// Die Familie kommt immer aus der Session (ctx.familyId), nie vom Client.
// Sonst könnte jeder eingeloggte Nutzer Aufgaben fremder Familien lesen und anlegen.
export const tasksRouter = router({
  add: familyProcedure
    .input(
      z.object({
        title: z.string().trim().min(1).max(100),
        description: z.string().trim().max(500).optional(),
        categoryId: z.uuid().nullable().optional(),
        icon: z.enum(TASK_ICON_NAMES).optional(),
        slots: z.array(z.string().trim().min(1).max(50)).max(10).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await createTask({
        ...input,
        familyId: ctx.familyId,
        createdById: ctx.userId,
      });
      if (!result.ok) throw unknownCategory();
      return result.task;
    }),
  /** Vorlagen für die Profilseite: alle Aufgaben der Familie samt Zeitfenstern */
  list: familyProcedure.query(({ ctx }) =>
    getTaskTemplates({ familyId: ctx.familyId }),
  ),

  update: familyProcedure
    .input(
      z.object({
        taskId: z.uuid(),
        title: z.string().trim().min(1).max(100),
        // null/leer = Feld leeren
        description: z.string().trim().max(500).nullable(),
        categoryId: z.uuid().nullable(),
        icon: z.enum(TASK_ICON_NAMES).nullable(),
        slots: z
          .array(
            z.object({
              id: z.uuid().optional(),
              label: z.string().trim().min(1).max(50),
            }),
          )
          .max(10),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await updateTask({
        ...input,
        description: input.description || null,
        familyId: ctx.familyId,
      });
      if (!result.ok) throw updateError(result);
    }),

  /** Archivieren (isActive: false) oder Zurückholen (true) */
  setActive: familyProcedure
    .input(z.object({ taskId: z.uuid(), isActive: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const found = await setTaskActive({ ...input, familyId: ctx.familyId });
      if (!found) throw notFound();
    }),
});

function notFound() {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "Aufgabe nicht gefunden.",
  });
}

function unknownCategory() {
  return new TRPCError({
    code: "BAD_REQUEST",
    message:
      "Diese Kategorie gibt es nicht mehr. Lade die Seite neu und wähle eine andere.",
  });
}

// Die Meldungen sind für Nutzer gedacht (siehe describeError) und werden angezeigt
function updateError(result: Extract<UpdateTaskResult, { ok: false }>) {
  if (result.reason === "not_found") return notFound();
  if (result.reason === "unknown_category") return unknownCategory();
  if (result.reason === "unknown_slot") {
    return new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Ein Zeitfenster gehört nicht (mehr) zu dieser Aufgabe. Lade die Seite neu und versuche es noch einmal.",
    });
  }
  return new TRPCError({
    code: "CONFLICT",
    message: `Das Zeitfenster „${result.label}“ hat schon Einträge im Verlauf und kann nicht entfernt werden. Benenne es stattdessen um.`,
  });
}
