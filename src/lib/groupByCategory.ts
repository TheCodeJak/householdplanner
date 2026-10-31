/**
 * Gruppiert Einträge nach ihrer Kategorie. Die Gruppen stehen in der
 * Reihenfolge, in der ihre Kategorie zum ersten Mal vorkommt – sortiert der
 * Server also nach Kategorie, bleibt diese Sortierung erhalten.
 * Reine Funktion: gleiche Eingabe, gleiche Ausgabe.
 */
export function groupByCategory<T extends { category: string }>(items: T[]) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const group = groups.get(item.category);
    if (group) group.push(item);
    else groups.set(item.category, [item]);
  }
  return [...groups].map(([category, items]) => ({ category, items }));
}
