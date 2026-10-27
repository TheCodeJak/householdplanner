// Reine Funktionen, die aus Plan-Daten Texte und Zahlen für die Oberfläche
// machen. Gleiche Eingabe → gleiche Ausgabe, kein React, kein Server.

import type { SlotView, TaskView } from "@/types/plan";

/** Begrüßung passend zur Tageszeit (lokale Uhrzeit des Browsers) */
export function greetingFor(now: Date): string {
  const h = now.getHours();
  if (h < 11) return "Guten Morgen";
  if (h < 18) return "Hallo";
  return "Guten Abend";
}

/** Erledigte und alle Einträge eines Tages; ein Slot zählt als eigener Eintrag */
export function dayProgress(tasks: TaskView[]) {
  const slots = tasks.flatMap((t) => t.slots);
  return {
    done: slots.filter((s) => s.status === "completed").length,
    total: slots.length,
  };
}

/** Kurzer Status unter dem Titel einer Karte, z.B. "Laura ist dran" */
export function slotStatusText({ status, assignee, completedBy }: SlotView) {
  if (status === "completed") {
    if (!completedBy) return "Erledigt";
    return completedBy.isCurrentUser
      ? "Von dir erledigt"
      : `Erledigt von ${completedBy.name}`;
  }
  if (status === "claimed" && assignee) {
    return assignee.isCurrentUser
      ? "Du bist dran"
      : `${assignee.name} ist dran`;
  }
  return "Noch frei";
}
