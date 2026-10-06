import { getDayPlanRows } from "@/db/queries/dayPlan";
import { groupDayPlan } from "@/lib/groupDayPlan";
import { z } from "zod";
import { familyProcedure, router } from "../init";

export const planRouter = router({
  getDay: familyProcedure
    .input(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .query(async ({ input, ctx }) => {
      const rows = await getDayPlanRows({
        familyId: ctx.familyId,
        date: input.date,
      });
      return groupDayPlan({ rows, currentUserId: ctx.userId });
    }),
});
