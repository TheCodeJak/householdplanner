"use client";

import { formatDate } from "@/lib/dateUtils";
import { shortenWeekDays } from "@/types";

type DayPickerProps = {
  weekDays: Date[];
  selectedDayIdx: number;
  onSelect: (idx: number) => void;
};

export default function DayPicker({
  weekDays,
  selectedDayIdx,
  onSelect,
}: DayPickerProps) {
  return (
    <div className="flex overflow-hidden mb-4">
      <div className="flex p-4 gap-x-1 w-full justify-center overflow-x-auto snap-x">
        {shortenWeekDays.map((day, i) => {
          const isSelected = selectedDayIdx === i;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`flex flex-1 flex-col items-center justify-center border border-line rounded-3xl shadow-xs transition-all snap-center bg-surface shrink-0 min-w-15 max-w-20 min-h-25 ${
                isSelected
                  ? "bg-linear-to-b from-orange-500 to-orange-400/50 scale-105"
                  : "bg-surface border-line hover:bg-orange-50 text-muted"
              }`}
            >
              <span
                className={`font-semibold text-sm ${isSelected ? "text-white" : "text-muted"} `}
              >
                {day}
              </span>
              <span
                className={`font-bold text-xl my-1 ${isSelected ? "text-white" : "text-fg"}`}
              >
                {formatDate(weekDays[i]).split(".")[0]}
              </span>
              <span
                className={`text-[10px] ${isSelected ? "text-white/90" : "text-muted"}`}
              >
                Mai
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
