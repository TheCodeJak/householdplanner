import { createTask, getTasks } from "@/db/queries/tasks";
import { TASK_ICON_NAMES } from "@/lib/taskIcons";
import { z } from "zod";
import { protectedProcedure, router } from "../init";

export const tasksRouter = router({
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
  getAll: protectedProcedure
    .input(z.object({ familyId: z.string() }))
    .query(({ input }) => getTasks({ familyId: input.familyId })),
});
