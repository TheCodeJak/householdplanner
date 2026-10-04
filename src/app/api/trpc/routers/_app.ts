import { router } from "../init";
import { assignmentsRouter } from "./assignments";
import { planRouter } from "./plan";
import { tasksRouter } from "./tasks";

export const appRouter = router({
  assignments: assignmentsRouter,
  plan: planRouter,
  tasks: tasksRouter,
});

export type AppRouter = typeof appRouter;
