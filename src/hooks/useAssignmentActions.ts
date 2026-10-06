import { SlotActionKey } from "@/lib/getSlotActions";
import { trpc } from "@/lib/trpc";
import { SlotRef } from "@/types/plan";

export function useAssignmentActions() {
  const utils = trpc.useUtils();
  const options = { onSettled: () => utils.plan.getDay.invalidate() };

  const mutations = {
    claim: trpc.assignments.claim.useMutation(options),
    claimAndComplete: trpc.assignments.claimAndComplete.useMutation(options),
    complete: trpc.assignments.complete.useMutation(options),
    release: trpc.assignments.release.useMutation(options),
    reopen: trpc.assignments.reopen.useMutation(options),
  };
  const all = Object.values(mutations);

  function run(key: SlotActionKey, ref: SlotRef, onSuccess: () => void) {
    mutations[key].mutate(ref, { onSuccess });
  }

  return {
    run,
    isPending: all.some((m) => m.isPending),
    error: all.find((m) => m.error)?.error?.message ?? null,
    reset: () => all.forEach((m) => m.reset()),
  };
}
