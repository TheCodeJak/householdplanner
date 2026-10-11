import { getMembers, getUserFamily } from "@/db/queries/family";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { familyProcedure, router } from "../init";

export const familyRouter = router({
  getUserFamily: familyProcedure.query(({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Du musst eingeloggt sein, um deine Familie zu sehen.",
      });
    }
    return getUserFamily(ctx.session.user.id);
  }),

  getMembers: familyProcedure
    .input(z.object({ familyId: z.string() }))
    .query(({ input, ctx }) => {
      if (input.familyId !== ctx.familyId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Du darfst nicht auf diese Familie zugreifen.",
        });
      }
      return getMembers(input.familyId);
    }),
});
