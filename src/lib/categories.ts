// Kategorien von Aufgaben. `task.category` ist in der Datenbank optional;
// Aufgaben ohne Kategorie landen in einer Sammelgruppe. Reine Funktion ohne
// React, damit Server (Tagesplan, Vorlagenliste) und Browser dasselbe nutzen.

export const DEFAULT_CATEGORY = "Sonstiges";

/** Kategorie einer Aufgabe: fehlt sie oder ist sie leer, gilt die Sammelgruppe */
export function normalizeCategory(value: string | null | undefined): string {
  return value?.trim() || DEFAULT_CATEGORY;
}
