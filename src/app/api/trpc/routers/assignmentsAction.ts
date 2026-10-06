import {
  completeAssignmentv2,
  deleteAssignmentv2,
  findAssignment,
  findSlot,
  getCompletedUser,
  isAssignmentCompleted,
  resolveAssignment,
  uncompleteAssignmentv2,
} from "@/db/queries/assignments";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { familyProcedure, router } from "../init";

const throwError = (code: TRPCError["code"], message: string) => {
  throw new TRPCError({
    code,
    message,
  });
};

const checkExistingSlot = async (slotId: string) => {
  const existingSlot = await findSlot(slotId);
  if (existingSlot) {
    throwError("CONFLICT", "Dieser Slot ist bereits belegt.");
  }
};

const checkExistingAssignment = async (
  taskId: string,
  slotId: string,
  date: string,
) => {
  const existingTask = await findAssignment(taskId, slotId, date);
  if (!existingTask) {
    throwError("BAD_REQUEST", "Diese Aufgabe existiert nicht.");
  }
};

export const assignmentActionsRouter = router({
  claim: familyProcedure
    .input(
      z.object({
        taskId: z.uuid(),
        slotId: z.uuid().optional(),
        date: z.date(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkExistingAssignment(
        input.taskId,
        input.slotId ?? "",
        input.date.toISOString(),
      );
      await checkExistingSlot(input.slotId ?? "");

      return resolveAssignment({
        ...input,
        assignedToId: ctx.userId,
        date: input.date.toISOString(),
      });
    }),
  claimAndComplete: familyProcedure
    .input(
      z.object({
        taskId: z.uuid(),
        slotId: z.uuid().optional(),
        date: z.date(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkExistingAssignment(
        input.taskId,
        input.slotId ?? "",
        input.date.toISOString(),
      );
      await checkExistingSlot(input.slotId ?? "");

      return resolveAssignment({
        ...input,
        assignedToId: ctx.userId,
        completedById: ctx.userId,
        date: input.date.toISOString(),
      });
    }),
  complete: familyProcedure
    .input(
      z.object({
        taskId: z.uuid(),
        slotId: z.uuid().optional(),
        date: z.date(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return completeAssignmentv2({
        ...input,
        completedById: ctx.userId,
        date: input.date.toISOString(),
      });
    }),
  release: familyProcedure
    .input(
      z.object({
        taskId: z.uuid(),
        slotId: z.uuid().optional(),
        date: z.date(),
      }),
    )
    .mutation(async ({ input }) => {
      await checkExistingAssignment(
        input.taskId,
        input.slotId ?? "",
        input.date.toISOString(),
      );
      const isCompleted = await isAssignmentCompleted(
        input.taskId,
        input.slotId ?? null,
        input.date.toISOString(),
      );
      if (isCompleted) {
        throwError(
          "CONFLICT",
          "Diese Aufgabe wurde bereits als erledigt markiert und kann nicht mehr freigegeben werden.",
        );
      }

      return deleteAssignmentv2({
        ...input,
        date: input.date.toISOString(),
      });
    }),
  reopen: familyProcedure
    .input(
      z.object({
        taskId: z.uuid(),
        slotId: z.uuid().optional(),
        date: z.date(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const assignedUserId = await getCompletedUser(
        input.taskId,
        input.slotId ?? null,
        input.date.toISOString(),
      );
      if (ctx.userId !== assignedUserId) {
        throwError(
          "CONFLICT",
          "Nur der zugewiesene Benutzer kann die Aufgabe wieder öffnen.",
        );
      }

      return uncompleteAssignmentv2(
        input.taskId,
        input.slotId ?? null,
        input.date.toISOString(),
      );
    }),
});
