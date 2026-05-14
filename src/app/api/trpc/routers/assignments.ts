import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../init";
import {
  getAssignmentForDate,
  getAssignmentsForWeek,
  createAssignment,
  deleteAssignment,
  findAssignment,
  completeAssignment,
  uncompleteAssignment,
} from "@/db/queries/assignments";

export const assignmentsRouter = router({
  getForDate: publicProcedure
    .input(z.object({ date: z.string(), familyId: z.uuid() }))
    .query(({ input }) => getAssignmentForDate(input.date, input.familyId)),

  getForWeek: publicProcedure
    .input(z.object({ mondayDate: z.string(), familyId: z.uuid() }))
    .query(({ input }) =>
      getAssignmentsForWeek(input.mondayDate, input.familyId),
    ),

  assign: protectedProcedure
    .input(z.object({ taskId: z.uuid(), date: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await findAssignment(input.taskId, input.date);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Aufgabe ist bereits jemandem zugewiesen.",
        });
      }
      return createAssignment({ ...input, assignedToId: ctx.userId });
    }),

  unassign: protectedProcedure
    .input(z.object({ assignmentId: z.uuid() }))
    .mutation(({ input }) => deleteAssignment(input.assignmentId)),

  complete: protectedProcedure
    .input(z.object({ assignmentId: z.uuid() }))
    .mutation(({ input, ctx }) =>
      completeAssignment(input.assignmentId, ctx.userId),
    ),

  uncomplete: protectedProcedure
    .input(z.object({ assignmentId: z.uuid() }))
    .mutation(({ input }) => uncompleteAssignment(input.assignmentId)),
});
