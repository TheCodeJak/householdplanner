// Grundgerüst für Design-Varianten, die man in der laufenden App vergleicht.
//
// So geht es: Eine Achse in VARIANT_AXES eintragen (Seite, Name, Optionen), im
// Code mit `useVariants().choice.<achse>` (1, 2, 3 …) zwischen den Looks wählen.
// Der Umschalter (VariantSwitcher) hängt im Layout, zeigt die Achsen der Seite,
// auf der man gerade ist, und erscheint nur, wenn es welche gibt. Ist
// entschieden, die Achse samt dem Zweig im Code löschen.
//
// Der Stand liegt nicht in der URL und nicht in einer Seite, sondern in einem
// Speicher außerhalb von React (wie useOpenState), der in localStorage
// gespiegelt wird: Die Auswahl bleibt über Seiten und Neuladen erhalten. Beim
// ersten Laden gewinnen URL-Parameter (?achse=2), praktisch zum Teilen eines
// Stands.
//
// Aufräumen, wenn man das Gerüst gar nicht mehr braucht: den Ordner _variants
// und die zwei Zeilen im Layout löschen.

import { useSyncExternalStore } from "react";

type AxisDefinition = {
  /** Die Achse erscheint auf Seiten, deren Pfad so beginnt, z. B. "/dashboard" */
  page: string;
  label: string;
  options: readonly string[];
};

// Eine Achse je offene Entscheidung; ist sie getroffen, den Eintrag und den
// Zweig im Code löschen. Ohne Einträge erscheint kein Umschalter.
// Beispiel: k: { page: "/dashboard", label: "Kopf der Kategorie", options: ["Ring", "Balken"] },
export const VARIANT_AXES: Record<string, AxisDefinition> = {};

export type VariantAxis = keyof typeof VARIANT_AXES;
export type VariantChoice = Record<VariantAxis, number>;

type State = { choice: VariantChoice };

const KEY = "householdplanner:variants";
const AXES = Object.keys(VARIANT_AXES) as VariantAxis[];

const DEFAULT: State = {
  choice: Object.fromEntries(AXES.map((a) => [a, 1])) as VariantChoice,
};

function valid(axis: VariantAxis, value: unknown): value is number {
  return (
    Number.isInteger(value) &&
    (value as number) >= 1 &&
    (value as number) <= VARIANT_AXES[axis].options.length
  );
}

function load(): State {
  const state: State = { choice: { ...DEFAULT.choice } };
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    for (const axis of AXES) {
      if (valid(axis, stored?.choice?.[axis])) {
        state.choice[axis] = stored.choice[axis];
      }
    }
  } catch {
    // localStorage gesperrt oder kaputter Inhalt: dann gilt der Standard
  }
  // URL-Parameter überschreiben den gespeicherten Stand (nur beim ersten Laden)
  const params = new URLSearchParams(window.location.search);
  for (const axis of AXES) {
    const value = Number(params.get(axis));
    if (params.has(axis) && valid(axis, value)) state.choice[axis] = value;
  }
  return state;
}

let current: State | null = null;
const listeners = new Set<() => void>();

function read(): State {
  current ??= load();
  return current;
}

function write(next: State) {
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // nicht speicherbar: gilt dann nur, bis die Seite neu geladen wird
  }
  listeners.forEach((l) => l());
}

export const variantActions = {
  setAxis: (axis: VariantAxis, value: number) =>
    write({ choice: { ...read().choice, [axis]: value } }),
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Aktueller Stand; auf dem Server immer der Standard (kein localStorage) */
export function useVariants(): State {
  return useSyncExternalStore(subscribe, read, () => DEFAULT);
}
