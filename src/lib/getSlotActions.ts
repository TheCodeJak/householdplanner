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

// Bis zu so vielen Zeichen passt eine Beschriftung (text-secondary) in eine halbe
// Sheet-Breite auf einem 375-px-Handy
const MAX_LABEL_SIDE_BY_SIDE = 16;

/**
 * Zwei Buttons nur dann gleich breit nebeneinander, wenn beide Beschriftungen
 * in eine Hälfte passen – sonst untereinander in voller Breite, statt einen zu
 * quetschen oder das Sheet aus dem Bildschirm zu schieben.
 */
export function fitsSideBySide(actions: SlotAction[]): boolean {
  return (
    actions.length === 2 &&
    actions.every((a) => a.label.length <= MAX_LABEL_SIDE_BY_SIDE)
  );
}
