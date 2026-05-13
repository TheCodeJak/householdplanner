import { z } from "zod";
import { publicProcedure, router } from "../init";
import { getTasksByFamily } from "@/db/queries/tasks";

export const tasksRouter = router({
  getByFamily: publicProcedure
    .input(z.object({ familyId: z.uuid() }))
    .query(({ input }) => getTasksByFamily(input.familyId)),
});
