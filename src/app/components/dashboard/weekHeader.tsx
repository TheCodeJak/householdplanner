"use client";

import NavButton from "@/app/components/layout/NavButton";
import { formatDate } from "@/lib/dateUtils";

type WeekHeaderProps = {
  monday: Date;
  weekDays: Date[];
  weekOffset: number;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
};

export default function WeekHeader({
  monday,
  weekDays,
  weekOffset,
  onPrevWeek,
  onNextWeek,
  onToday,
}: WeekHeaderProps) {
  return (
    <div className="px-5 pb-1">
      {/* <p className="text-sm font-semibold uppercase tracking-widest text-slate-600">
        Kalenderwoche {getWeekNumber(monday)}
      </p> */}
      <div className="flex items-center justify-center gap-8 mt-3 bg-amber-200">
        <NavButton onClick={onPrevWeek} dir="left" />
        <span className="w-55 text-center text-xl font-semibold text-slate-800 bg-green-200">
          {formatDate(weekDays[0])} – {formatDate(weekDays[6])}
          {weekDays[6].getFullYear()}
        </span>
        <NavButton onClick={onNextWeek} dir="right" />
        {/* {weekOffset !== 0 && (
          <button
            type="button"
            onClick={onToday}
            className="ml-1 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100 transition-colors"
          >
            Heute
          </button>
        )} */}
      </div>
    </div>
  );
}
