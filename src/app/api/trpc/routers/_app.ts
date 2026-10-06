import { router } from "../init";
import { assignmentsRouter } from "./assignments";
import { assignmentActionsRouter } from "./assignmentsAction";
import { planRouter } from "./plan";
import { tasksRouter } from "./tasks";

export const appRouter = router({
  assignments: assignmentActionsRouter,
  legacyAssignments: assignmentsRouter,
  plan: planRouter,
  tasks: tasksRouter,
});

export type AppRouter = typeof appRouter;
