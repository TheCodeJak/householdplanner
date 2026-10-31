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
    <div className="mt-6 mb-2 flex items-center justify-between px-2">
      <h2 className="text-caption font-semibold tracking-wider text-subtle uppercase">
        {children}
      </h2>
      {action}
    </div>
  );
}
