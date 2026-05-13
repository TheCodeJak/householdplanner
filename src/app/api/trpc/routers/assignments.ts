import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../init";
import {
  getAssignmentForDate,
  getAssignmentsForWeek,
  createAssignment,
  deleteAssignment,
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
    .mutation(({ input, ctx }) =>
      createAssignment({ ...input, assignedToId: ctx.userId }),
    ),

  unassign: protectedProcedure
    .input(z.object({ assignmentId: z.uuid() }))
    .mutation(({ input }) => deleteAssignment(input.assignmentId)),
});
