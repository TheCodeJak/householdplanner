import type { CategoryView } from "@/types/plan";
import type { CategoryOption, TaskTemplate } from "@/types/profile";
import { categoryKey, NO_CATEGORY } from "./categories";

/**
 * Gruppiert Einträge nach ihrer Kategorie (über die id, nicht über den Namen:
 * so bleibt eine Gruppe dieselbe, wenn sie umbenannt wird). Die Gruppen stehen
 * in der Reihenfolge, in der ihre Kategorie zum ersten Mal vorkommt – sortiert
 * der Server also nach Kategorie, bleibt diese Sortierung erhalten.
 * Reine Funktion: gleiche Eingabe, gleiche Ausgabe.
 */
export function groupByCategory<T extends { category: CategoryView }>(
  items: T[],
) {
  const groups = new Map<string, { category: CategoryView; items: T[] }>();
  for (const item of items) {
    const key = categoryKey(item.category);
    const group = groups.get(key);
    if (group) group.items.push(item);
    else groups.set(key, { category: item.category, items: [item] });
  }
  return [...groups.values()];
}

export type TemplateGroup = {
  category: CategoryView;
  items: TaskTemplate[];
};

/**
 * Gruppen für die Profilseite: erst alle Kategorien der Familie in ihrer
 * Reihenfolge, auch leere, dann "Sonstiges", aber nur wenn es Aufgaben ohne
 * Kategorie gibt.
 * Eine Aufgabe, deren Kategorie (noch) nicht in der Liste steht, bekommt ihre
 * eigene Gruppe, statt zu verschwinden.
 */
export function groupTemplatesByCategory(
  tasks: TaskTemplate[],
  categories: CategoryOption[],
): TemplateGroup[] {
  const groups = new Map<string, TemplateGroup>();
  for (const option of categories) {
    groups.set(option.id, {
      category: {
        id: option.id,
        name: option.name,
        tone: option.tone,
        icon: option.icon,
      },
      items: [],
    });
  }

  const none: TemplateGroup = { category: NO_CATEGORY, items: [] };
  for (const task of tasks) {
    const { id } = task.category;
    if (id === null) {
      none.items.push(task);
      continue;
    }
    let group = groups.get(id);
    if (!group) {
      group = { category: task.category, items: [] };
      groups.set(id, group);
    }
    group.items.push(task);
  }

  return none.items.length > 0
    ? [...groups.values(), none]
    : [...groups.values()];
}
