import { useState } from "react";

/**
 * Welche Kategorien sind aufgeklappt? Startet mit `initiallyOpen`.
 * Später z.B. in localStorage merken – pro Gerät, kein Server nötig.
 */
export function useOpenCategories(initiallyOpen: string[]) {
  const [open, setOpen] = useState(() => new Set(initiallyOpen));

  return {
    isOpen: (name: string) => open.has(name),
    toggle: (name: string) =>
      setOpen((prev) => {
        const next = new Set(prev);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        return next;
      }),
  };
}
