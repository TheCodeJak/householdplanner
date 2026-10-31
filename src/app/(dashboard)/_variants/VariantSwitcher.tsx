"use client";

// Umschalter für die Design-Varianten (siehe variantStore.ts), hängt im Layout
// und bleibt deshalb beim Seitenwechsel bestehen. Zeigt die Achsen der Seite,
// auf der man gerade ist, und gar nichts, wenn es dort keine gibt.

import { useIsClient } from "@/hooks/useIsClient";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  useVariants,
  VARIANT_AXES,
  variantActions,
  type VariantAxis,
} from "./variantStore";

export function VariantSwitcher() {
  const { choice } = useVariants();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isClient = useIsClient();
  if (!isClient) return null;

  const axes = (Object.keys(VARIANT_AXES) as VariantAxis[]).filter((axis) =>
    pathname.startsWith(VARIANT_AXES[axis].page),
  );
  // Nichts zu vergleichen: kein Knopf
  if (axes.length === 0) return null;

  // Portal an <body>: Das Layout ist `isolate` (eigene Stapel-Ebene), darin
  // käme kein z-index über den klebenden Kopf und jaklibs Sheets.
  return createPortal(
    <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-3 z-[1100] flex flex-col-reverse items-start gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs rounded-full bg-slate-900/85 px-3 py-1.5 font-semibold text-white shadow-lg backdrop-blur"
      >
        Varianten {open ? "▴" : "▾"}
      </button>

      {open && (
        <div className="max-h-[60dvh] w-64 overflow-y-auto rounded-2xl bg-slate-900/90 p-3 text-white shadow-xl backdrop-blur">
          {axes.map((axis) => (
            <div key={axis} className="mb-2.5 last:mb-0">
              <p className="mb-1 text-[10px] font-semibold tracking-wide text-white/50 uppercase">
                {VARIANT_AXES[axis].label}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {VARIANT_AXES[axis].options.map((name, idx) => {
                  const value = idx + 1;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => variantActions.setAxis(axis, value)}
                      aria-pressed={choice[axis] === value}
                      className={`rounded-lg px-1.5 py-1.5 text-center text-[11px] leading-tight font-medium ${
                        choice[axis] === value
                          ? "bg-white text-slate-900"
                          : "bg-white/10 text-white/80"
                      }`}
                    >
                      {value} · {name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
