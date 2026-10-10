// Icon-Schlüssel, Anzeigenamen und Farben der Aufgaben-Icons – ohne JSX,
// damit auch Server-Code (Zod, Queries) das importieren kann.
// Die Zeichnungen selbst liegen in components/icons/tasks/taskIconPaths.tsx.

// Diese Schlüssel landen in der DB – daher ASCII ohne Umlaute
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

export function isTaskIconName(value: string): value is TaskIconName {
  return (TASK_ICON_NAMES as readonly string[]).includes(value);
}

// Anzeigenamen mit Umlauten für die UI (Icon-Auswahl, aria-label)
export const taskIconLabels: Record<TaskIconName, string> = {
  aufraeumen: "Aufräumen",
  waschen: "Waschen",
  saugen: "Saugen",
  wischen: "Wischen",
  putzen: "Putzen",
  kochen: "Kochen",
  essen: "Essen",
  braten: "Braten",
  toasten: "Toasten",
  einkaufen: "Einkaufen",
  besorgungen: "Besorgungen",
  kaffee: "Kaffee",
  kuehlschrank: "Kühlschrank",
  muell: "Müll",
  hund: "Hund",
  katze: "Katze",
  post: "Post",
  paket: "Paket",
  wecker: "Wecker",
  zuhause: "Zuhause",
  kalender: "Kalender",
  planung: "Planung",
  finanzen: "Finanzen",
  apotheke: "Apotheke",
  schluessel: "Schlüssel",
  pflanzen: "Pflanzen",
  buegeln: "Bügeln",
  bett: "Bett",
  spuelen: "Spülen",
};

// Pastell-Kachel + passende dunklere Icon-Farbe (im Dark Mode: gedämpfte
// transparente Fläche + helle Icon-Farbe). Die Klassen müssen als
// vollständige Strings dastehen, sonst findet Tailwind sie beim Build nicht.
export const TASK_ICON_TONES = {
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
  pink: "bg-pink-100 text-pink-700 dark:bg-pink-400/15 dark:text-pink-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300",
  lime: "bg-lime-100 text-lime-700 dark:bg-lime-400/15 dark:text-lime-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  slate: "bg-surface-2 text-muted",
} as const;

export type TaskIconTone = keyof typeof TASK_ICON_TONES;

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
