"use client";

import { useState } from "react";
import type { Row } from "@/types/plan";
import { UserAvatar } from "@/app/components/shared/userAvatar";
import {
  CheckIcon,
  CheckCircleIcon,
  QuestionCircleIcon,
  PlusCircleIcon,
} from "@/app/components/icons";

type MobileViewProps = {
  rows: Row[];
  weekDays: Date[];
  selectedDayIdx: number;
  onCellClick: (taskId: string, taskName: string) => void;
};

type Filter = "all" | "open" | "done";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "open", label: "Offen" },
  { key: "done", label: "Erledigt" },
];

export default function MobileView({
  rows,
  weekDays,
  selectedDayIdx,
  onCellClick,
}: MobileViewProps) {
  const [filter, setFilter] = useState<Filter>("all");

  // Weekly progress
  const allCells = rows.flatMap((row) => row.cells).filter(Boolean);
  const completedCount = allCells.filter((c) => c!.isCompleted).length;
  const totalCount = allCells.length;
  const percent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Per-user weekly progress
  const userMap = new Map<
    string,
    { color: string; initial: string; completed: number; total: number }
  >();
  rows.forEach((row) => {
    row.cells.forEach((cell) => {
      if (!cell) return;
      const entry = userMap.get(cell.assigneeName) ?? {
        color: cell.assigneeColor,
        initial: cell.assigneeName[0],
        completed: 0,
        total: 0,
      };
      entry.total++;
      if (cell.isCompleted) entry.completed++;
      userMap.set(cell.assigneeName, entry);
    });
  });

  // Filtered task list for selected day
  const filteredRows = rows.filter((row) => {
    const cell = row.cells[selectedDayIdx];
    if (filter === "open") return !cell?.isCompleted;
    if (filter === "done") return !!cell?.isCompleted;
    return true;
  });

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Wochenfortschritt */}
      {totalCount > 0 && (
        <div className="flex items-center gap-4 rounded-2xl bg-orange-50 border border-orange-100 px-4 py-3.5">
          {/* Circular Progress */}
          <div className="shrink-0 relative h-16 w-16">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="#fde0cc"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="#f97316"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(percent / 100) * 97.4} 97.4`}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800">
              {percent}%
            </span>
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-600 mb-1">
              Wochenfortschritt
            </span>
            <span className="text-xs text-slate-400 mb-2">
              {completedCount} von {totalCount} Aufgaben erledigt
            </span>
            {[...userMap.entries()].map(
              ([name, { color, initial, completed, total }]) => (
                <div key={name} className="flex items-center gap-2 mt-1">
                  <UserAvatar initial={initial} color={color} size={18} />
                  <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: color,
                        width: `${(completed / total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {completed} erledigt
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Header + Filter */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-slate-800">Aufgaben</span>
        <div className="flex rounded-full border border-slate-200 bg-white p-0.5">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filter === key
                  ? "bg-orange-500 text-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Aufgabenliste */}
      <div className="flex flex-col gap-2">
        {filteredRows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Keine Aufgaben vorhanden.
          </p>
        ) : (
          filteredRows.map((row) => {
            const cell = row.cells[selectedDayIdx];
            const isCompleted = cell?.isCompleted ?? false;
            const hasAssignee = !!cell?.assigneeName;
            const accentColor = isCompleted
              ? "#22c55e"
              : hasAssignee
                ? "#f97316"
                : undefined;

            return (
              <button
                key={row.id}
                type="button"
                onClick={() => onCellClick(row.id, row.name)}
                className="relative flex items-center gap-3 rounded-2xl border border-gray-100 bg-white pl-5 pr-4 py-3 shadow-xs text-left active:scale-[.99] transition-transform"
              >
                {/* Accent bar */}
                {accentColor && (
                  <div
                    className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}

                {/* Links: Avatar oder Fragezeichen */}
                <div className="shrink-0">
                  {hasAssignee ? (
                    cell!.completerDiffers ? (
                      <span className="flex items-center -space-x-2">
                        <UserAvatar
                          initial={cell!.assigneeName[0]}
                          color={cell!.assigneeColor}
                          completed={false}
                          size={40}
                        />
                        <UserAvatar
                          initial={cell!.completedByName![0]}
                          color={cell!.completedByColor ?? "#22c55e"}
                          completed={true}
                          size={40}
                        />
                      </span>
                    ) : (
                      <UserAvatar
                        initial={cell!.assigneeName[0]}
                        color={cell!.assigneeColor}
                        completed={isCompleted}
                        size={40}
                      />
                    )
                  ) : (
                    <QuestionCircleIcon size={40} />
                  )}
                </div>

                {/* Mitte: Titel + Status — zweizeilig, eng */}
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-slate-800 truncate">
                    {row.name}
                  </span>
                  <span className="block text-xs mt-px">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                        <CheckCircleIcon size={10} className="text-green-500" />
                        Erledigt
                      </span>
                    ) : hasAssignee ? (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cell!.assigneeColor }}
                        />
                        Übernommen
                      </span>
                    ) : (
                      <span className="text-orange-500 font-medium">
                        Noch offen
                      </span>
                    )}
                  </span>
                </div>

                {/* Rechts: Aktionsbutton */}
                <div className="shrink-0">
                  {isCompleted ? (
                    <div className="h-8 w-8 flex items-center justify-center rounded-full border-2 border-green-400">
                      <CheckIcon size={14} className="text-green-500" />
                    </div>
                  ) : hasAssignee ? (
                    <div className="h-8 w-8 flex items-center justify-center rounded-full border-2 border-orange-400">
                      <CheckIcon size={14} className="text-orange-500" />
                    </div>
                  ) : (
                    <PlusCircleIcon size={32} />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
