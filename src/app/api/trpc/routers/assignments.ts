import {
  claimSlot,
  completeSlot,
  releaseSlot,
  reopenSlot,
  slotBelongsToFamily,
} from "@/db/queries/assignments";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { familyProcedure, router } from "../init";

const slotInput = z.object({
  taskId: z.uuid(),
  slotId: z.uuid().nullish(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

type SlotInput = z.infer<typeof slotInput>;

function orConflict<T>(row: T | null): T {
  if (!row) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Das ist nicht mehr möglich, die Aufgabe hat sich geändert.",
    });
  }
  return row;
}

async function claim(
  familyId: string,
  userId: string,
  input: SlotInput,
  alsoComplete: boolean,
) {
  if (!(await slotBelongsToFamily(familyId, input))) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Aufgabe nicht gefunden.",
    });
  }
  const created = await claimSlot({ ...input, userId, alsoComplete });
  if (!created) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Diese Aufgabe ist bereits vergeben.",
    });
  }
  return created;
}

export const assignmentsRouter = router({
  claim: familyProcedure
    .input(slotInput)
    .mutation(({ input, ctx }) =>
      claim(ctx.familyId, ctx.userId, input, false),
    ),

  claimAndComplete: familyProcedure
    .input(slotInput)
    .mutation(({ input, ctx }) => claim(ctx.familyId, ctx.userId, input, true)),

  release: familyProcedure.input(slotInput).mutation(async ({ input, ctx }) =>
    orConflict(
      await releaseSlot({
        ...input,
        familyId: ctx.familyId,
        userId: ctx.userId,
      }),
    ),
  ),

  complete: familyProcedure.input(slotInput).mutation(async ({ input, ctx }) =>
    orConflict(
      await completeSlot({
        ...input,
        familyId: ctx.familyId,
        userId: ctx.userId,
      }),
    ),
  ),

  reopen: familyProcedure.input(slotInput).mutation(async ({ input, ctx }) =>
    orConflict(
      await reopenSlot({
        ...input,
        familyId: ctx.familyId,
        userId: ctx.userId,
      }),
    ),
  ),
});
