// Reine Funktionen: Texte zu einem Zeitfenster. Dabei steht auch da, wenn jemand
// etwas FÜR jemand anderen erledigt hat („Tim für Laura“), nicht nur, wer es war.

import type { Person, SlotView } from "@/types/plan";

const firstName = (person: Person) => person.name.split(" ")[0];

/** Wer: "Du" oder der Vorname */
const who = (person: Person) =>
  person.isCurrentUser ? "Du" : firstName(person);
/** Für wen: "dich" oder der Vorname */
const forWhom = (person: Person) =>
  person.isCurrentUser ? "dich" : firstName(person);
/** Von wem: "dir" oder der Vorname */
const byWhom = (person: Person) =>
  person.isCurrentUser ? "dir" : firstName(person);

/** Hat jemand anderes erledigt, als eingeteilt war? */
function doneForSomeoneElse(slot: SlotView): boolean {
  return (
    slot.status === "completed" &&
    !!slot.assignee &&
    !!slot.completedBy &&
    slot.assignee.id !== slot.completedBy.id
  );
}

/** Kurztext rechts in der Slot-Zeile: "Frei", "Laura", "Du für Laura" */
export function slotShort(slot: SlotView): string {
  if (slot.status === "open") return "Frei";
  if (slot.status === "claimed") {
    return slot.assignee ? who(slot.assignee) : "Übernommen";
  }
  if (doneForSomeoneElse(slot)) {
    return `${who(slot.completedBy!)} für ${forWhom(slot.assignee!)}`;
  }
  const person = slot.completedBy ?? slot.assignee;
  return person ? who(person) : "Erledigt";
}

/** Satz unter dem Titel: "Von Laura für dich erledigt", "Du bist dran", "Noch frei" */
export function slotSentence(slot: SlotView): string {
  if (slot.status === "open") return "Noch frei";
  if (slot.status === "claimed") {
    if (!slot.assignee) return "Übernommen";
    return slot.assignee.isCurrentUser
      ? "Du bist dran"
      : `${firstName(slot.assignee)} ist dran`;
  }
  if (!slot.completedBy) return "Erledigt";
  if (doneForSomeoneElse(slot)) {
    return `Von ${byWhom(slot.completedBy)} für ${forWhom(slot.assignee!)} erledigt`;
  }
  return `Von ${byWhom(slot.completedBy)} erledigt`;
}
