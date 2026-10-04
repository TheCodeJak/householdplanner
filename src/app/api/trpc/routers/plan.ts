import { getDayPlanRows } from "@/db/queries/dayPlan";
import { z } from "zod";
import { familyProcedure, router } from "../init";

export const planRouter = router({
  // TEMP (Schritt 5): gibt noch die rohen Zeilen zurück, in Schritt 6 wird daraus TaskView[]
  getDay: familyProcedure
    .input(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .query(({ input, ctx }) =>
      getDayPlanRows({ familyId: ctx.familyId, date: input.date }),
    ),
});
