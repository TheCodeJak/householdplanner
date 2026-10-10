"use client";

import { addDays, getMonth, isSameDay } from "@/lib/dateUtils";
import { useEffect, useState } from "react";

const SHORT_DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const DAY_MS = 86_400_000;

// true, sobald die Seite ein Stück gescrollt ist – dann wird der Header zu Milchglas
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function ChevronButton({
  dir,
  onClick,
}: {
  dir: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "left" ? "Vorherige Woche" : "Nächste Woche"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-glass bg-surface/60 text-muted shadow-sm shadow-brand-900/5 backdrop-blur transition-colors active:bg-surface"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}

// Monat + Wochenstreifen zum direkten Antippen eines Tages. Klebt oben und
// wird beim Scrollen zu Milchglas.
export function WeekStripHeader({
  date,
  isToday,
  onShift,
  goToday,
}: {
  date: Date;
  isToday: boolean;
  onShift: (delta: number) => void;
  goToday: () => void;
}) {
  const scrolled = useScrolled();
  const today = new Date();
  const monday = addDays(date, -((date.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  return (
    <header
      className={`sticky top-0 z-30 border-b transition-[background-color,border-color] duration-300 ${
        scrolled
          ? "border-glass bg-surface/65 backdrop-blur-xl"
          : "border-transparent"
      }`}
    >
      <div className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <div className="mb-3 flex items-center gap-2 px-1">
          <h1 className="flex-1 text-xl font-bold tracking-tight text-fg">
            {getMonth(date.getMonth())}{" "}
            <span className="font-medium text-subtle">
              {date.getFullYear()}
            </span>
          </h1>
          {!isToday && (
            <button
              type="button"
              onClick={goToday}
              className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-semibold text-white"
            >
              Heute
            </button>
          )}
          <ChevronButton dir="left" onClick={() => onShift(-7)} />
          <ChevronButton dir="right" onClick={() => onShift(7)} />
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const selected = isSameDay(d, date);
            const isTodayPill = isSameDay(d, today);
            const delta = Math.round((d.getTime() - date.getTime()) / DAY_MS);
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => onShift(delta)}
                aria-current={selected ? "date" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-2xl py-2 transition-colors ${
                  selected
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                    : "border border-glass bg-surface/55 text-fg-2"
                }`}
              >
                <span
                  className={`text-[10px] font-medium ${
                    selected ? "text-white/80" : "text-subtle"
                  }`}
                >
                  {SHORT_DAYS[d.getDay()]}
                </span>
                <span
                  className={`text-sm font-bold ${
                    !selected && isTodayPill ? "text-brand-600 dark:text-brand-400" : ""
                  }`}
                >
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
