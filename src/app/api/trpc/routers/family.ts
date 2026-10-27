import { getFamilyOverview, regenerateInviteCode } from "@/db/queries/family";
import { isRateLimited, RATE_LIMITS } from "@/lib/rateLimit";
import { TRPCError } from "@trpc/server";
import { familyProcedure, router } from "../init";

// Gründen und Beitreten laufen nicht hier, sondern als Server Actions im
// Onboarding (app/(auth)/onboarding/actions.ts): Sie müssen das Login-Token
// aktualisieren, und dort hat der Nutzer noch keine Familie.
export const familyRouter = router({
  /** Name, Einladungscode, Mitglieder und Wochenstatistik für die Profilseite */
  overview: familyProcedure.query(async ({ ctx }) => {
    const overview = await getFamilyOverview({
      familyId: ctx.familyId,
      userId: ctx.userId,
    });
    if (!overview) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Familie nicht gefunden.",
      });
    }
    return overview;
  }),

  /** Neuer Einladungscode (der alte gilt dann nicht mehr). Nur für Admins. */
  regenerateInviteCode: familyProcedure.mutation(async ({ ctx }) => {
    if (
      await isRateLimited(
        `family-regenerate:user:${ctx.userId}`,
        RATE_LIMITS.familyRegenerateUser,
      )
    ) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Zu viele Versuche. Bitte warte einen Moment.",
      });
    }
    const result = await regenerateInviteCode({
      familyId: ctx.familyId,
      userId: ctx.userId,
    });
    if (!result.ok) {
      // CONFLICT statt FORBIDDEN: FORBIDDEN bedeutet bei uns "keine Familie"
      throw new TRPCError({
        code: "CONFLICT",
        message: "Nur Admins der Familie können einen neuen Code erzeugen.",
      });
    }
    return { inviteCode: result.inviteCode };
  }),
});
