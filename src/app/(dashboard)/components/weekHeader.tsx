"use client";

import { getWeekNumber, formatDate } from "@/lib/dateUtils";
import NavButton from "../../components/layout/navButton";

type WeekHeaderProps = {
  monday: Date;
  weekDays: Date[];
  weekOffset: number;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onNewTask: () => void;
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
    <div className="px-5 pt-5 pb-1">
      <p className="text-sm font-semibold uppercase tracking-widest text-slate-600">
        Kalenderwoche {getWeekNumber(monday)}
      </p>
      <div className="flex items-center justify-center gap-2 mt-3">
        <NavButton onClick={onPrevWeek} dir="left" />
        <span className="w-55 text-center text-xl font-semibold text-slate-800">
          {formatDate(weekDays[0])} – {formatDate(weekDays[6])}
          {weekDays[6].getFullYear()}
        </span>
        <NavButton onClick={onNextWeek} dir="right" />
        {weekOffset !== 0 && (
          <button
            type="button"
            onClick={onToday}
            className="ml-1 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100 transition-colors"
          >
            Heute
          </button>
        )}
      </div>
    </div>
  );
}
