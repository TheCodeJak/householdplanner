// Farben der Personen (Avatare). Gedämpft statt knallig: mittlere Sättigung,
// und jede Farbe ist so dunkel, dass weiße Buchstaben mindestens 4,5:1 Kontrast
// haben. Ausgewählt nach Farbabstand (CIE Lab, ΔE): Die ersten sechs Personen
// unterscheiden sich um mindestens ΔE 42, alle acht um mindestens ΔE 27.
// (Die alte Palette lag bei ΔE 14 und war fast doppelt so satt.)
export const PERSON_COLORS = [
  "#4558ba", // Blau
  "#308230", // Grün
  "#ba4f45", // Terrakotta
  "#337b8a", // Petrol
  "#ba4593", // Magenta
  "#867132", // Oliv
  "#9345ba", // Violett
  "#3a8264", // Meergrün
];

/** Die n-te Farbe der Palette (reihum), z. B. für Demo-Daten und als Rückfall */
export function personColor(index: number): string {
  const n = PERSON_COLORS.length;
  return PERSON_COLORS[((index % n) + n) % n];
}

/**
 * Farbe für ein neues Familienmitglied: die erste der Palette, die noch kein
 * anderes Mitglied trägt. So haben bis zu acht Personen verschiedene Farben,
 * und die Farbe hängt an der Person (gespeichert in user.color), nicht an ihrer
 * Position in der Familie: Verlässt jemand die Familie, ändert sich bei den
 * anderen nichts. Sind alle vergeben, geht es reihum von vorn los.
 */
export function freeColor(taken: (string | null)[]): string {
  return (
    PERSON_COLORS.find((color) => !taken.includes(color)) ??
    personColor(taken.length)
  );
}
