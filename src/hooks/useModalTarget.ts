import { useState } from "react";

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
      // die Einblend-Animation. Daher erst ein Frame geschlossen malen lassen.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsOpen(true)),
      );
    },
    close: () => setIsOpen(false),
  };
}
