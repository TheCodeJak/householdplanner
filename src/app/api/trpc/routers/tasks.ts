import { z } from "zod";
import { protectedProcedure, router } from "../init";
import { createTask } from "@/db/queries/tasks";
import { TASK_ICON_NAMES } from "@/lib/taskIcons";

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
});
