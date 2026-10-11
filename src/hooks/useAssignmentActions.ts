import { SlotActionKey } from "@/lib/getSlotActions";
import { trpc } from "@/lib/trpc";
import { SlotRef } from "@/types/plan";

/**
 * Die fünf Aktionen auf einem Slot (übernehmen, erledigen …) als Mutationen.
 * `run(key, slot, onSuccess)` führt die passende aus; die Buttons dafür
 * liefert getSlotActions().
 */
export function useAssignmentActions() {
  const utils = trpc.useUtils();
  // Nach jeder Aktion (Erfolg oder Fehler) den Tagesplan als veraltet markieren:
  // React Query lädt ihn neu, und alle Karten zeigen den neuen Stand
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
    // Der ganze Fehler (nicht nur der Text), damit describeError() ihn einordnen kann
    error: all.find((m) => m.error)?.error ?? null,
    reset: () => all.forEach((m) => m.reset()),
  };
}
