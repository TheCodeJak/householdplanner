"use client";

// ⚠️ TEMPORÄR: Umschalter für die Dashboard-Varianten (oben rechts).
// Kann samt ./_variants gelöscht werden, sobald die Entscheidung steht.

import { useIsClient } from "@/hooks/useIsClient";
import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  VARIANT_AXES,
  type VariantAxis,
  type VariantChoice,
} from "./variantConfig";

function hrefWith(current: VariantChoice, axis: VariantAxis, value: number) {
  const next = { ...current, [axis]: value };
  const query = Object.entries(next)
    .map(([key, v]) => `${key}=${v}`)
    .join("&");
  return `/dashboard?${query}`;
}

export function VariantSwitcher({ active }: { active: VariantChoice }) {
  const [open, setOpen] = useState(false);
  const isClient = useIsClient();
  if (!isClient) return null;

  // Portal an <body>: Das Dashboard-Layout ist `isolate` (eigene Stapel-Ebene),
  // darin käme kein z-index über den klebenden Kopf und jaklibs Modal.
  return createPortal(
    <div className="fixed top-[max(0.5rem,env(safe-area-inset-top))] right-3 z-[1100] flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full bg-slate-900/85 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur"
      >
        Varianten {Object.values(active).join("·")} {open ? "▴" : "▾"}
      </button>

      {open && (
        <div className="w-64 rounded-2xl bg-slate-900/90 p-3 text-white shadow-xl backdrop-blur">
          {(Object.keys(VARIANT_AXES) as VariantAxis[]).map((axis) => (
            <div key={axis} className="mb-2.5 last:mb-0">
              <p className="mb-1 text-[10px] font-semibold tracking-wide text-white/50 uppercase">
                {VARIANT_AXES[axis].label}
              </p>
              <div
                className={`grid gap-1 ${
                  VARIANT_AXES[axis].options.length % 2 === 0
                    ? "grid-cols-2"
                    : "grid-cols-3"
                }`}
              >
                {VARIANT_AXES[axis].options.map((name, idx) => {
                  const value = idx + 1;
                  const isActive = active[axis] === value;
                  return (
                    <Link
                      key={name}
                      href={hrefWith(active, axis, value)}
                      replace
                      scroll={false}
                      className={`rounded-lg px-1.5 py-1.5 text-center text-[11px] leading-tight font-medium ${
                        isActive
                          ? "bg-white text-slate-900"
                          : "bg-white/10 text-white/80"
                      }`}
                    >
                      {value} · {name}
                    </Link>
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
