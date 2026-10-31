import type { useWeekCarousel } from "@/hooks/useWeekCarousel";
import {
  addDays,
  daysBetween,
  isSameDay,
  mondayOf,
  weekDays,
} from "@/lib/dateUtils";
import { DayPill } from "./DayPill";

/**
 * Wochenstreifen als Karussell aus drei Wochen (vorige, aktuelle, nächste).
 * Die Nachbarwochen ragen halb transparent am Rand hinein und zeigen so, dass
 * man wischen kann. Die Scroll-Logik steckt in useWeekCarousel.
 */
export function WeekCarousel({
  date,
  onShift,
  scrollerProps,
}: {
  date: Date;
  onShift: (delta: number) => void;
  /** Ref + Scroll-/Touch-Handler aus useWeekCarousel */
  scrollerProps: ReturnType<typeof useWeekCarousel>["scrollerProps"];
}) {
  const today = new Date();
  const monday = mondayOf(date);
  const weeks = [-7, 0, 7].map((offset) => weekDays(addDays(monday, offset)));

  return (
    <div
      {...scrollerProps}
      // snap-x snap-mandatory: nach dem Wischen rastet der Browser auf einer
      //   Woche ein (die Wochen haben snap-center)
      // overscroll-x-contain: seitliches Wischen löst kein "Zurück" im Browser aus
      // px-6: die mittlere Woche ist schmaler als der Streifen → die Nachbarn
      //   ragen links und rechts ins Bild
      // [scrollbar-width:none] + [&::-webkit-scrollbar]:hidden: Scrollbalken
      //   ausblenden (Firefox bzw. Chrome/Safari)
      className="flex snap-x snap-mandatory scrollbar-none gap-1.5 overflow-x-auto overscroll-x-contain px-6 py-3 [&::-webkit-scrollbar]:hidden"
    >
      {weeks.map((week, w) => {
        const isCurrentWeek = w === 1;
        return (
          <div
            key={week[0].toISOString()}
            aria-hidden={!isCurrentWeek}
            className={`grid w-full shrink-0 snap-center grid-cols-7 gap-1.5${
              isCurrentWeek ? "" : "opacity-45"
            }`}
          >
            {week.map((day) => (
              <DayPill
                key={day.toISOString()}
                day={day}
                selected={isSameDay(day, date)}
                isToday={isSameDay(day, today)}
                focusable={isCurrentWeek}
                onSelect={() => onShift(daysBetween(date, day))}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
