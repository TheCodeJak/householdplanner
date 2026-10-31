import { useState } from "react";
import { useOpenState } from "./useOpenState";

/**
 * Welche Kategorien sind aufgeklappt? Beim ersten Anzeigen sind die in
 * `initiallyOpen` offen, der Rest zu. Was man selbst umschaltet, wird pro
 * Gerät gemerkt (siehe useOpenState) und bleibt auch nach einem Seitenwechsel.
 */
export function useOpenCategories(initiallyOpen: string[]) {
  // Die Einträge sind Schlüssel der Kategorien (categoryKey), keine Namen:
  // So bleibt der Zustand beim Umbenennen erhalten.
  const state = useOpenState("profile-categories");
  // Der Standard wird einmal festgehalten. Käme eine neue Kategorie dazu und
  // rückte nach vorn, würde sonst eine unberührte Gruppe von selbst zuklappen.
  const [defaults] = useState(() => new Set(initiallyOpen));

  const isOpen = (name: string) => state.isOpen(name, defaults.has(name));
  return {
    isOpen,
    toggle: (name: string) => state.set(name, !isOpen(name)),
  };
}
