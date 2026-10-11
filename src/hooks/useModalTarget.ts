import { useState } from "react";

/**
 * Zustand für ein Modal, das sich auf ein Ziel bezieht (z.B. einen Slot).
 * `target` bleibt nach dem Schließen erhalten, damit das Sheet beim
 * Herausfahren nicht plötzlich leer wird; nur `isOpen` wird false.
 */
export function useModalTarget<T>() {
  const [target, setTarget] = useState<T | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return {
    target,
    isOpen,
    openFor: (t: T) => {
      setTarget(t);
      // Beim ersten Öffnen wird das Modal erst durch setTarget eingehängt.
      // Würde es direkt geöffnet gerendert, gäbe es keinen Ausgangszustand für
      // die Einblend-Animation. Daher erst ein Frame geschlossen malen lassen:
      // requestAnimationFrame läuft direkt vor dem nächsten Bild – doppelt
      // verschachtelt also erst, nachdem der geschlossene Zustand gemalt wurde.
      requestAnimationFrame(() => requestAnimationFrame(() => setIsOpen(true)));
    },
    close: () => setIsOpen(false),
  };
}
