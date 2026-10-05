import { findAssignment, findSlot } from "@/db/queries/assignments";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { familyProcedure, router } from "../init";

export const assignmentActionsRouter = router({
  claimSlot: familyProcedure
    .input(
      z.object({
        taskId: z.uuid(),
        slotId: z.uuid().optional(),
        date: z.date(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingTask = await findAssignment(
        input.taskId,
        input.slotId ?? "",
        input.date.toISOString(),
      );

      if (existingTask) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Diese Aufgabe .",
        });
      }

      if (input.slotId) {
        const existingSlot = await findSlot(input.slotId);
        if (!existingSlot) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Dieser Slot ist bereits belegt.",
          });
        }
      }
      // return createAssignment({ ...input, assignedToId: ctx.userId });
    }),
});
