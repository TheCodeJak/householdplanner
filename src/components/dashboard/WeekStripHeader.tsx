"use client";

import { useScrolled } from "@/hooks/useScrolled";
import { useWeekCarousel } from "@/hooks/useWeekCarousel";
import { mondayOf, toIsoDate } from "@/lib/dateUtils";
import { MonthNav } from "./MonthNav";
import { WeekCarousel } from "./WeekCarousel";

/**
 * Klebender Kopf des Dashboards: Monatszeile mit Pfeilen und darunter das
 * Wochen-Karussell. Oben ist er durchsichtig; sobald man scrollt, wird er zu
 * Milchglas, damit die Karten darunter nicht mit dem Text kollidieren.
 */
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
  const { scrollerProps, scrollWeek } = useWeekCarousel(
    toIsoDate(mondayOf(date)),
    onShift,
  );

  return (
    <header
      // sticky top-0: scrollt mit, bis er oben anstößt, und bleibt dann stehen
      // transform-gpu: eigene Grafikebene, damit der Kopf beim Scrollen nicht
      //   ständig mit dem Inhalt darunter neu gezeichnet wird (verhindert Ruckeln)
      // transition-[…]: nur Hintergrund und Rand blenden weich über
      className={`sticky top-0 z-30 transform-gpu border-b pt-3 pb-3 transition-[background-color,border-color] duration-300 ${
        scrolled
          ? "border-glass bg-surface/80 backdrop-blur-md"
          : "border-transparent"
      }`}
    >
      <MonthNav
        date={date}
        isToday={isToday}
        onPrev={() => scrollWeek(-1)}
        onNext={() => scrollWeek(1)}
        onToday={goToday}
      />
      <WeekCarousel
        date={date}
        onShift={onShift}
        scrollerProps={scrollerProps}
      />
    </header>
  );
}
