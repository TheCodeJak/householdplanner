import { useState } from "react";

export function useModalTarget<T>() {
  const [target, setTarget] = useState<T | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return {
    target,
    isOpen,
    openFor: (t: T) => {
      setTarget(t);
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
  };
}
