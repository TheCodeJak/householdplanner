import type { SlotView } from "@/types/plan";

export type SlotActionKey =
  "claim" | "claimAndComplete" | "complete" | "release" | "reopen";

export type SlotAction = {
  key: SlotActionKey;
  label: string;
  variant: "primary" | "ghost";
};

/**
 * Welche Buttons das Detail-Sheet für einen Slot zeigt (siehe Tabelle in
 * docs/PLAN-neue-struktur.md, Abschnitt 8). Der erste Eintrag ist die
 * Hauptaktion.
 */
export function getSlotActions(slot: SlotView): SlotAction[] {
  if (slot.status === "open") {
    return [
      { key: "claim", label: "Übernehmen", variant: "primary" },
      { key: "claimAndComplete", label: "Schon erledigt", variant: "ghost" },
    ];
  }
  if (slot.status === "claimed") {
    if (slot.assignee?.isCurrentUser) {
      return [
        {
          key: "complete",
          label: "Erledigt",
          variant: "primary",
        },
        { key: "release", label: "Freigeben", variant: "ghost" },
      ];
    }
    return [{ key: "complete", label: "Selbst erledigen", variant: "primary" }];
  }
  if (slot.completedBy?.isCurrentUser) {
    return [{ key: "reopen", label: "Rückgängig", variant: "ghost" }];
  }
  return [];
}
