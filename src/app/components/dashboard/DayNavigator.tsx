"use client";

import NavButton from "@/app/components/layout/NavButton";
import { getDay, getMonth } from "@/lib/dateUtils";

interface DayNavigatorProps {
  date: Date;
  isToday: boolean;
  onShift: (delta: number) => void;
  goToday: () => void;
}

export default function DayNavigator({
  date,
  isToday,
  onShift,
  goToday,
}: DayNavigatorProps) {
  return (
    <div className="flex flex-col px-5 pb-1 gap-2">
      <div className="flex items-center justify-center gap-2 mt-3">
        <NavButton onClick={() => onShift(-1)} dir="left" />

        <span className="w-75 text-center text-lg font-semibold text-slate-800">
          {getDay(date.getDay())}
          {", "}
          {date.getDate()}
          {". "}
          {getMonth(date.getMonth()).slice(0, 3)}
          {". "}
          {date.getFullYear()}
        </span>

        <NavButton onClick={() => onShift(1)} dir="right" />
      </div>
      <div className="flex justify-center">
        {!isToday && (
          <button
            type="button"
            onClick={() => goToday()}
            className="ml-1 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-400"
          >
            Heute
          </button>
        )}
      </div>
    </div>
  );
}
