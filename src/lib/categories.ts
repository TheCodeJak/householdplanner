// Kategorien von Aufgaben. Eine Kategorie ist eine Zeile in der Tabelle
// `category` (Name + Farbe pro Familie); `task.category_id` verweist darauf.
// Aufgaben ohne Kategorie landen in der Sammelgruppe "Sonstiges", die keine
// Zeile ist. Reine Funktionen ohne React, damit Server (Tagesplan,
// Vorlagenliste) und Browser dasselbe nutzen.

import type { CategoryView } from "@/types/plan";
import { isTaskIconName, isTaskIconTone } from "./taskIcons";

export const DEFAULT_CATEGORY = "Sonstiges";
export const MAX_CATEGORY_NAME = 50;

/**
 * Warum ein Kategoriename nicht geht (Text für Nutzer) oder null, wenn er passt.
 * Eine Stelle für Formular und Server, damit beide dasselbe prüfen.
 */
export function categoryNameProblem(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Bitte gib einen Namen ein.";
  if (trimmed.length > MAX_CATEGORY_NAME) return "Der Name ist zu lang.";
  if (trimmed.toLowerCase() === DEFAULT_CATEGORY.toLowerCase()) {
    return `„${DEFAULT_CATEGORY}“ ist für Aufgaben ohne Kategorie reserviert.`;
  }
  return null;
}

/** Die Sammelgruppe für Aufgaben ohne Kategorie: keine Zeile, feste neutrale Farbe */
export const NO_CATEGORY: CategoryView = {
  id: null,
  name: DEFAULT_CATEGORY,
  tone: "slate",
  icon: null,
};

/**
 * Macht aus den Spalten eines Joins auf `category` (alle null, wenn die Aufgabe
 * keine Kategorie hat) die Kategorie für die Oberfläche. Ein unbekannter Ton
 * aus der DB fällt auf das neutrale Grau zurück, statt die Seite zu brechen.
 */
export function categoryFromRow(row: {
  categoryId: string | null;
  categoryName: string | null;
  categoryTone: string | null;
  categoryIcon: string | null;
}): CategoryView {
  if (!row.categoryId || row.categoryName === null) return NO_CATEGORY;
  return {
    id: row.categoryId,
    name: row.categoryName,
    tone:
      row.categoryTone && isTaskIconTone(row.categoryTone)
        ? row.categoryTone
        : NO_CATEGORY.tone,
    icon:
      row.categoryIcon && isTaskIconName(row.categoryIcon)
        ? row.categoryIcon
        : null,
  };
}

/** Schlüssel einer Kategorie für Gruppen, Auf-/Zu-Zustand usw. ("none" = Sonstiges) */
export const categoryKey = (category: CategoryView) => category.id ?? "none";
