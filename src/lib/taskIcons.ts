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
  slate: "bg-surface-2 text-muted",
} as const;

export type TaskIconTone = keyof typeof TASK_ICON_TONES;

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
