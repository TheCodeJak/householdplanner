import { router } from "../init";
import { assignmentsRouter } from "./assignments";
import { tasksRouter } from "./tasks";

export const appRouter = router({
  assignments: assignmentsRouter,
  tasks: tasksRouter,
});

export type AppRouter = typeof appRouter;
