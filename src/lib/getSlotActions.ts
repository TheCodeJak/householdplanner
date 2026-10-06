import type { SlotView } from "@/types/plan";

export type SlotActionKey =
  | "claim"
  | "claimAndComplete"
  | "complete"
  | "release"
  | "reopen";

export type SlotAction = {
  key: SlotActionKey;
  label: string;
  variant: "primary" | "ghost";
};

export function getSlotActions(slot: SlotView): SlotAction[] {
  if (slot.status === "open") {
    return [
      { key: "claim", label: "Ich mache das", variant: "primary" },
      { key: "claimAndComplete", label: "Sofort erledigen", variant: "ghost" },
    ];
  }
  if (slot.status === "claimed") {
    if (slot.assignee?.isCurrentUser) {
      return [
        {
          key: "complete",
          label: "Als erledigt markieren",
          variant: "primary",
        },
        { key: "release", label: "Nicht mehr ich", variant: "ghost" },
      ];
    }
    return [
      { key: "complete", label: "Ich habe das erledigt", variant: "primary" },
    ];
  }
  if (slot.completedBy?.isCurrentUser) {
    return [{ key: "reopen", label: "Doch nicht erledigt", variant: "ghost" }];
  }
  return [];
}
