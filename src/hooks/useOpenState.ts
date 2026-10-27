import { useSyncExternalStore } from "react";

/**
 * Auf-/Zu-Zustand von Klappbereichen (Kategorien, Aufgaben), der einen
 * Seitenwechsel überlebt, z.B. Dashboard → Profil → zurück. Er liegt nicht im
 * Component-State (der geht beim Verlassen der Seite verloren), sondern in
 * einem Speicher außerhalb von React, der in `localStorage` gespiegelt wird:
 * pro Gerät und auch nach dem Neuladen erhalten, ohne Server.
 *
 * Gemerkt wird nur, was man selbst umgeschaltet hat. Alles andere folgt dem
 * Standard, den die Stelle beim Aufruf von `isOpen` mitgibt (z.B. "fertige
 * Gruppen zu"). Jeder `scope` ist ein eigener Bereich ("dashboard-categories"),
 * so teilen sich verschiedene Listen nicht versehentlich Namen.
 */

const PREFIX = "householdplanner:open:";

type Overrides = Record<string, boolean>;

// Für den Server (gibt es dort kein localStorage) und für leere Bereiche.
// Wird nie verändert, nur ersetzt.
const EMPTY: Overrides = {};

// Pro Bereich einmal gelesen. React erwartet für denselben Stand dieselbe
// Referenz, sonst würde es endlos neu rendern.
const cache = new Map<string, Overrides>();
const listeners = new Set<() => void>();

function load(scope: string): Overrides {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(PREFIX + scope) ?? "{}",
    );
    if (parsed && typeof parsed === "object") {
      // Nur echte Wahrheitswerte übernehmen: der Inhalt kommt aus dem Browser
      return Object.fromEntries(
        Object.entries(parsed).filter(([, v]) => typeof v === "boolean"),
      );
    }
  } catch {
    // localStorage gesperrt (z.B. privater Modus) oder kaputter Inhalt:
    // dann gilt der Standard, die Seite funktioniert trotzdem
  }
  return EMPTY;
}

function read(scope: string): Overrides {
  let overrides = cache.get(scope);
  if (!overrides) {
    overrides = load(scope);
    cache.set(scope, overrides);
  }
  return overrides;
}

function write(scope: string, next: Overrides) {
  cache.set(scope, next);
  try {
    localStorage.setItem(PREFIX + scope, JSON.stringify(next));
  } catch {
    // nicht speicherbar: gilt dann nur, bis die Seite neu geladen wird
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Ein anderer Tab hat geschrieben: neu lesen, damit beide gleich aussehen
  const onStorage = (event: StorageEvent) => {
    if (event.key === null) cache.clear();
    else if (event.key.startsWith(PREFIX)) {
      cache.delete(event.key.slice(PREFIX.length));
    } else return;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useOpenState(scope: string) {
  const overrides = useSyncExternalStore(
    subscribe,
    () => read(scope),
    () => EMPTY,
  );

  return {
    /** Der gemerkte Wert oder, wenn nichts gemerkt ist, der Standard */
    isOpen: (key: string, byDefault: boolean) =>
      // hasOwn: Ein Name wie "constructor" darf nicht aus dem Prototyp kommen
      Object.hasOwn(overrides, key) ? overrides[key] : byDefault,
    set: (key: string, open: boolean) =>
      // read statt overrides: bei schnellen Klicks nie auf altem Stand aufbauen
      write(scope, { ...read(scope), [key]: open }),
  };
}
