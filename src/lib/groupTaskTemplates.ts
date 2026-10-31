import type { TaskTemplate } from "@/types/profile";
import { categoryFromRow } from "./categories";
import { isTaskIconName } from "./taskIcons";

type TemplateRow = {
  id: string;
  title: string;
  icon: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryTone: string | null;
  categoryIcon: string | null;
  description: string | null;
  isActive: boolean;
  slotId: string | null;
  slotLabel: string | null;
};

/**
 * Macht aus den Zeilen "Aufgabe + ein Zeitfenster" (Join) eine Liste von
 * Vorlagen mit ihren Zeitfenstern. Die Reihenfolge der Zeilen bleibt erhalten.
 * Reine Funktion: gleiche Eingabe, gleiche Ausgabe.
 */
export function groupTaskTemplates(rows: TemplateRow[]): TaskTemplate[] {
  const templates = new Map<string, TaskTemplate>();

  for (const row of rows) {
    let template = templates.get(row.id);
    if (!template) {
      template = {
        id: row.id,
        title: row.title,
        icon: row.icon && isTaskIconName(row.icon) ? row.icon : null,
        category: categoryFromRow(row),
        description: row.description ?? undefined,
        slots: [],
        isActive: row.isActive,
      };
      templates.set(row.id, template);
    }
    if (row.slotId && row.slotLabel !== null) {
      template.slots.push({ id: row.slotId, label: row.slotLabel });
    }
  }

  return [...templates.values()];
}
