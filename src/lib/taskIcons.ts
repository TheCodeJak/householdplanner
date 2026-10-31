// Icon-Schlüssel und Farben der Aufgaben-Icons – bewusst ohne JSX, damit auch
// Server-Code (Zod-Validierung, groupDayPlan) diese Datei importieren kann.
// Die Zeichnungen selbst liegen in components/icons/taskIconPaths.tsx.

// Diese Schlüssel landen in der DB – daher ASCII ohne Umlaute
// `as const` macht daraus ein festes Tupel statt string[] – so kann TypeScript
// daraus den Typ TaskIconName ableiten und Zod daraus z.enum(...) bauen.
export const TASK_ICON_NAMES = [
  "aufraeumen",
  "waschen",
  "saugen",
  "wischen",
  "putzen",
  "kochen",
  "essen",
  "braten",
  "toasten",
  "einkaufen",
  "besorgungen",
  "kaffee",
  "kuehlschrank",
  "muell",
  "hund",
  "katze",
  "post",
  "paket",
  "wecker",
  "zuhause",
  "kalender",
  "planung",
  "finanzen",
  "apotheke",
  "schluessel",
  "pflanzen",
  "buegeln",
  "bett",
  "spuelen",
] as const;

export type TaskIconName = (typeof TASK_ICON_NAMES)[number];

// Type Guard: prüft einen beliebigen Text aus der DB. Gibt sie true zurück,
// behandelt TypeScript `value` danach als TaskIconName.
export function isTaskIconName(value: string): value is TaskIconName {
  return (TASK_ICON_NAMES as readonly string[]).includes(value);
}

// Pastell-Kachel + passende dunklere Icon-Farbe (im Dark Mode: gedämpfte
// transparente Fläche + helle Icon-Farbe). Die Klassen müssen als
// vollständige Strings dastehen, sonst findet Tailwind sie beim Build nicht.
export const TASK_ICON_TONES = {
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  violet:
    "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
  pink: "bg-pink-100 text-pink-700 dark:bg-pink-400/15 dark:text-pink-300",
  emerald:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300",
  indigo:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300",
  lime: "bg-lime-100 text-lime-700 dark:bg-lime-400/15 dark:text-lime-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300",
  green: "bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300",
  cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300",
  purple:
    "bg-purple-100 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300",
  fuchsia:
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-400/15 dark:text-fuchsia-300",
  slate: "bg-surface-2 text-muted",
} as const;

export type TaskIconTone = keyof typeof TASK_ICON_TONES;

// Type Guard wie isTaskIconName: prüft einen Ton-Namen aus der DB (category.tone)
export function isTaskIconTone(value: string): value is TaskIconTone {
  return Object.hasOwn(TASK_ICON_TONES, value);
}

// Alle gültigen Töne als Tupel (für z.enum). Dazu gehören auch ältere Töne, die
// die Farbauswahl nicht mehr anbietet, damit bestehende Kategorien gültig bleiben.
export const TASK_TONE_NAMES = Object.keys(TASK_ICON_TONES) as [
  TaskIconTone,
  ...TaskIconTone[],
];

// Die Farben, die die Auswahl anbietet: 15 in 3 Reihen à 5. Ausgesucht nach
// Farbabstand (CIE Lab, ΔE): Der kleinste Abstand zweier Farben beträgt 20
// (Smaragd ↔ Türkis); bei den alten zehn Tönen waren es 14. Mehr als 15 gleiche
// Abstände gibt es nicht, ohne dass sich Paare stark ähneln. Die Reihenfolge ist
// so gewählt, dass auch Nachbarn im Raster verschieden sind (mindestens ΔE 90).
export const TASK_TONE_CHOICES: readonly TaskIconTone[] = [
  "green",
  "blue",
  "teal",
  "rose",
  "sky",
  "pink",
  "lime",
  "indigo",
  "emerald",
  "orange",
  "cyan",
  "fuchsia",
  "amber",
  "purple",
  "slate",
];

export const TASK_TONE_LABELS: Record<TaskIconTone, string> = {
  sky: "Hellblau",
  blue: "Blau",
  cyan: "Cyan",
  teal: "Türkis",
  emerald: "Smaragd",
  green: "Grün",
  lime: "Limette",
  amber: "Gelb",
  orange: "Orange",
  rose: "Rot",
  pink: "Pink",
  fuchsia: "Magenta",
  purple: "Lila",
  violet: "Violett",
  indigo: "Indigo",
  slate: "Grau",
};

// Weicher Farbverlauf in der Farbe der Aufgabe, z.B. als Kopfbereich im Detail-Sheet
export const TASK_ICON_GLOWS: Record<TaskIconTone, string> = {
  sky: "from-sky-100 dark:from-sky-400/15",
  amber: "from-amber-100 dark:from-amber-400/15",
  violet: "from-violet-100 dark:from-violet-400/15",
  pink: "from-pink-100 dark:from-pink-400/15",
  emerald: "from-emerald-100 dark:from-emerald-400/15",
  teal: "from-teal-100 dark:from-teal-400/15",
  indigo: "from-indigo-100 dark:from-indigo-400/15",
  lime: "from-lime-100 dark:from-lime-400/15",
  rose: "from-rose-100 dark:from-rose-400/15",
  orange: "from-orange-100 dark:from-orange-400/15",
  green: "from-green-100 dark:from-green-400/15",
  cyan: "from-cyan-100 dark:from-cyan-400/15",
  blue: "from-blue-100 dark:from-blue-400/15",
  purple: "from-purple-100 dark:from-purple-400/15",
  fuchsia: "from-fuchsia-100 dark:from-fuchsia-400/15",
  slate: "from-surface-2",
};

// Eine feste Farbe pro Icon, grob nach Bereichen gruppiert
export const taskIconTones: Record<TaskIconName, TaskIconTone> = {
  // Reinigung & Wäsche
  aufraeumen: "sky",
  waschen: "sky",
  saugen: "sky",
  wischen: "sky",
  putzen: "sky",
  buegeln: "sky",
  spuelen: "sky",
  // Küche
  kochen: "amber",
  essen: "amber",
  braten: "amber",
  toasten: "amber",
  kaffee: "amber",
  kuehlschrank: "amber",
  // Erledigungen
  einkaufen: "violet",
  besorgungen: "violet",
  post: "violet",
  paket: "violet",
  // Tiere & Pflanzen
  hund: "pink",
  katze: "pink",
  pflanzen: "emerald",
  muell: "teal",
  // Organisation & Zuhause
  wecker: "indigo",
  zuhause: "indigo",
  kalender: "indigo",
  planung: "indigo",
  schluessel: "indigo",
  bett: "indigo",
  finanzen: "lime",
  apotheke: "rose",
};

// Die Töne als Hex-Werte für Flächen, deren Farbe erst zur Laufzeit feststeht
// (z.B. CategoryGroup: Farbe = erstes Icon der Kategorie). Die Werte werden
// als CSS-Variablen gesetzt, die Klassen lesen nur diese – so reicht ein
// Klassen-String für alle Töne. Werte = Tailwind-Palette 50 / 100 / 600.
export const TASK_TONE_HEX: Record<
  TaskIconTone,
  { 50: string; 100: string; 600: string }
> = {
  sky: { 50: "#f0f9ff", 100: "#e0f2fe", 600: "#0284c7" },
  amber: { 50: "#fffbeb", 100: "#fef3c7", 600: "#d97706" },
  violet: { 50: "#f5f3ff", 100: "#ede9fe", 600: "#7c3aed" },
  pink: { 50: "#fdf2f8", 100: "#fce7f3", 600: "#db2777" },
  emerald: { 50: "#ecfdf5", 100: "#d1fae5", 600: "#059669" },
  teal: { 50: "#f0fdfa", 100: "#ccfbf1", 600: "#0d9488" },
  indigo: { 50: "#eef2ff", 100: "#e0e7ff", 600: "#4f46e5" },
  lime: { 50: "#f7fee7", 100: "#ecfccb", 600: "#65a30d" },
  rose: { 50: "#fff1f2", 100: "#ffe4e6", 600: "#e11d48" },
  orange: { 50: "#fff7ed", 100: "#ffedd5", 600: "#ea580c" },
  green: { 50: "#f0fdf4", 100: "#dcfce7", 600: "#16a34a" },
  cyan: { 50: "#ecfeff", 100: "#cffafe", 600: "#0891b2" },
  blue: { 50: "#eff6ff", 100: "#dbeafe", 600: "#2563eb" },
  purple: { 50: "#faf5ff", 100: "#f3e8ff", 600: "#9333ea" },
  fuchsia: { 50: "#fdf4ff", 100: "#fae8ff", 600: "#c026d3" },
  slate: { 50: "#f8fafc", 100: "#f1f5f9", 600: "#475569" },
};
