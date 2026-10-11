import type { ReactNode } from "react";

// Weiches Abbremsen am Ende (schnell los, sanft ankommen) – wirkt beim
// Auf- und Zuklappen natürlicher als das lineare "ease-out".
const EASE = "ease-[cubic-bezier(0.25,1,0.5,1)]";

/**
 * Auf- und Zuklappen mit Animation.
 *
 * Höhe: Ein Grid mit einer Zeile, deren Höhe zwischen 0fr und 1fr wechselt –
 * anders als height: auto lässt sich das per transition animieren.
 * Inhalt: blendet zusätzlich ein und gleitet ein Stück von oben herein,
 * damit er nicht nur "abgeschnitten" auftaucht.
 * `inert` nimmt zugeklappten Inhalt aus der Tab-Reihenfolge.
 * Bei "Bewegung reduzieren" (motion-reduce) springt es ohne Animation.
 */
export function Collapse({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div
      inert={!open}
      className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${EASE} ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={`transition-[opacity,translate] duration-300 motion-reduce:transition-none ${EASE} ${
            open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
