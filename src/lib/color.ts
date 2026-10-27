const PALETTE = [
  "#4f46e5",
  "#b45309",
  "#047857",
  "#dc2626",
  "#7c3aed",
  "#db2777",
  "#0369a1",
];

/**
 * Feste Farbe pro Person, berechnet aus der User-ID (einfacher String-Hash):
 * gleiche ID → immer dieselbe Farbe, ohne sie in der DB speichern zu müssen.
 */
export function colorFromUserId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0x7fffffff;
  }
  return PALETTE[hash % PALETTE.length];
}
