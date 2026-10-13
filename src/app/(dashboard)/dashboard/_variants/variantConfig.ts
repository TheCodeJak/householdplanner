// ⚠️ TEMPORÄR: Varianten-Achsen für die Gruppierung im Dashboard.
// Ohne Parameter (bzw. g=1) bleibt das Dashboard genau wie bisher.

export const VARIANT_AXES = {
  g: {
    label: "Gruppierung",
    options: [
      "Aktuell (keine)",
      "Farbige Gruppen",
      "Überschriften",
      "Gruppen + Karten",
    ],
  },
  k: { label: "Fortschritt im Kopf", options: ["Zähler", "Balken", "Ring"] },
  z: { label: "Beim Öffnen", options: ["Alle offen", "Erledigte zu"] },
} as const;

export type VariantAxis = keyof typeof VARIANT_AXES;
export type VariantChoice = Record<VariantAxis, number>;

/** Liest ?g=2&k=1… – ungültige oder fehlende Werte werden zu 1 */
export function parseVariants(params: URLSearchParams): VariantChoice {
  const choice = {} as VariantChoice;
  for (const axis of Object.keys(VARIANT_AXES) as VariantAxis[]) {
    const value = Number(params.get(axis));
    const max = VARIANT_AXES[axis].options.length;
    choice[axis] =
      Number.isInteger(value) && value >= 1 && value <= max ? value : 1;
  }
  return choice;
}
