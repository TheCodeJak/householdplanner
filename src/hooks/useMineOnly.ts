import { useOpenState } from "./useOpenState";

/**
 * Ist der Filter „nur meine Aufgaben“ an? Der Zustand bleibt beim Seitenwechsel
 * und nach dem Neuladen erhalten (pro Gerät): Er liegt im selben Speicher wie
 * das Auf- und Zuklappen der Gruppen (useOpenState), nur unter eigenem Namen.
 */
export function useMineOnly() {
  const state = useOpenState("dashboard-filter");
  return [
    state.isOpen("mine", false),
    (mineOnly: boolean) => state.set("mine", mineOnly),
  ] as const;
}
