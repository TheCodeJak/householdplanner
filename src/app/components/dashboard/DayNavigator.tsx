"use client";

import NavButton from "@/app/components/layout/NavButton";
import { getDay, getDayByDayOffset, getMonth } from "@/lib/dateUtils";

type DaySelectProps = {
  dayOffset: number;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
};

export default function DayNavigator({
  dayOffset,
  onPrevDay,
  onNextDay,
  onToday,
}: DaySelectProps) {
  const selectedDay = getDayByDayOffset(dayOffset);
  return (
    <div className="flex flex-col px-5 pb-1 gap-2">
      <div className="flex items-center justify-center gap-2 mt-3">
        <NavButton onClick={onPrevDay} dir="left" />

        <span className="w-75 text-center text-lg font-semibold text-slate-800">
          {getDay(selectedDay.getDay())}
          {", "}
          {selectedDay.getDate()}
          {". "}
          {getMonth(selectedDay.getMonth()).slice(0, 3)}
          {". "}
          {selectedDay.getFullYear()}
        </span>

        <NavButton onClick={onNextDay} dir="right" />
      </div>
      <div className="flex justify-center">
        {dayOffset !== 0 && (
          <button
            type="button"
            onClick={onToday}
            className="ml-1 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-400"
          >
            Heute
          </button>
        )}
      </div>
    </div>
  );
}
