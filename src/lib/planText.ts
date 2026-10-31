// Reine Funktionen, die aus Plan-Daten Texte und Zahlen für die Oberfläche
// machen. Gleiche Eingabe → gleiche Ausgabe, kein React, kein Server.

import type { TaskView } from "@/types/plan";

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
