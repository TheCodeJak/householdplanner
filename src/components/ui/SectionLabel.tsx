import type { ReactNode } from "react";

/** Kleine Überschrift über einem Bereich, z.B. "FAMILIE · 3", rechts optional eine Aktion */
export function SectionLabel({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    // min-h-9: gleiche Höhe wie eine Aktion rechts, damit beide mittig zueinander stehen
    <div className="mt-5 mb-1 flex min-h-9 items-center justify-between px-2">
      <h2 className="text-secondary font-semibold tracking-wide text-subtle uppercase">
        {children}
      </h2>
      {action}
    </div>
  );
}
