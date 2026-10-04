import { getUserFamily } from "@/db/queries/family";
import { initTRPC, TRPCError } from "@trpc/server";
import type { Session } from "next-auth";

export type Context = {
  session: Session | null;
};

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  const userId = ctx.session?.user?.id;
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: { ...ctx, userId: userId },
  });
});

export const familyProcedure = t.procedure.use(async ({ ctx, next }) => {
  const userId = ctx.session?.user?.id;
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const familyId = await getUserFamily(userId);
  if (!familyId) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({
    ctx: { ...ctx, userId: userId, familyId: familyId },
  });
});
