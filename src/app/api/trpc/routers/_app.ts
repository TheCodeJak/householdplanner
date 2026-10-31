import { router } from "../init";
import { assignmentsRouter } from "./assignments";
import { categoriesRouter } from "./categories";
import { familyRouter } from "./family";
import { planRouter } from "./plan";
import { tasksRouter } from "./tasks";

// Alle tRPC-Router der App. Der Browser bekommt über `AppRouter` die Typen
// aller Procedures, z.B. trpc.plan.getDay.useQuery(...) ist voll typisiert.
export const appRouter = router({
  assignments: assignmentsRouter,
  categories: categoriesRouter,
  plan: planRouter,
  tasks: tasksRouter,
  family: familyRouter,
});

export type AppRouter = typeof appRouter;
