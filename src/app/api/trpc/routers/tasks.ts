import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../init";
import { createTask, getTasksByFamily } from "@/db/queries/tasks";
import { TASK_ICON_NAMES } from "@/lib/taskIcons";

export const tasksRouter = router({
  getByFamily: publicProcedure
    .input(z.object({ familyId: z.uuid() }))
    .query(({ input }) => getTasksByFamily(input.familyId)),
  add: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        familyId: z.uuid(),
        category: z.string().optional(),
        icon: z.enum(TASK_ICON_NAMES).optional(),
        slots: z.array(z.string()).optional(),
      }),
    )
    .mutation(({ input, ctx }) =>
      createTask({ ...input, createdById: ctx.userId }),
    ),
});
