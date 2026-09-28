"use client";

import { useRef, useState } from "react";
import type { Row } from "@/types/plan";
import { UserAvatar } from "@/app/components/shared/userAvatar";
import {
  CheckIcon,
  CheckCircleIcon,
  QuestionCircleIcon,
  PlusCircleIcon,
} from "@/app/components/icons";
import { Card } from "jaklib/core";

type MobileViewProps = {
  rows: Row[];
  weekDays: Date[];
  selectedDayIdx: number;
  onCellClick: (
    taskId: string,
    taskName: string,
    slotId: string | null,
  ) => void;
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

  // Weekly progress — count all slot entries across all days
  const allEntries = rows.flatMap((row) =>
    row.cells.flatMap((cell) => cell.filter((e) => e.data)),
  );
  const completedCount = allEntries.filter((e) => e.data!.isCompleted).length;
  const totalCount = allEntries.length;
  const percent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Per-user weekly progress
  const userMap = new Map<
    string,
    { color: string; initial: string; completed: number; total: number }
  >();
  allEntries.forEach((entry) => {
    const d = entry.data!;
    const prev = userMap.get(d.assigneeName) ?? {
      color: d.assigneeColor,
      initial: d.assigneeName[0],
      completed: 0,
      total: 0,
    };
    prev.total++;
    if (d.isCompleted) prev.completed++;
    userMap.set(d.assigneeName, prev);
  });

  // Filter rows for selected day
  const filteredRows = rows.filter((row) => {
    const dayCell = row.cells[selectedDayIdx];
    const hasSlots = dayCell.length > 1;

    if (hasSlots) {
      const allDone = dayCell.every((e) => e.data?.isCompleted);
      const anyDone = dayCell.some((e) => e.data?.isCompleted);
      if (filter === "done") return allDone;
      if (filter === "open") return !allDone;
      return true;
    }

    const entry = dayCell[0];
    if (filter === "open") return !entry.data?.isCompleted;
    if (filter === "done") return !!entry.data?.isCompleted;
    return true;
  });

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {totalCount > 0 && (
        <div className="flex items-center gap-4 rounded-2xl bg-orange-50 border border-orange-100 px-4 py-3.5">
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

      {/* <Card className="flex-col">
        <span className="flex w-full justify-center text-sm text-slate-600">
          Keine Aufgabe vorhanden
        </span>
        <span className="text-xs text-slate-400">
          Über das + können Aufgaben hinzugefügt werden
        </span>
      </Card> */}

      <div className="flex flex-col gap-2">
        {filteredRows.length === 0 ? (
          <Card className="flex-col">
            <span className="flex w-full justify-center text-sm text-slate-600">
              Keine Aufgabe vorhanden
            </span>
            <span className="text-xs text-slate-400">
              Über das + können Aufgaben hinzugefügt werden
            </span>
          </Card>
        ) : (
          filteredRows.map((row) => {
            const dayCell = row.cells[selectedDayIdx];
            const hasSlots = dayCell.length > 1;

            if (hasSlots) {
              return (
                <SlottedCard
                  key={row.id}
                  row={row}
                  dayCell={dayCell}
                  onSlotClick={(slotId) =>
                    onCellClick(row.id, row.name, slotId)
                  }
                  onSwipeLeft={() => console.log("left")}
                  onSwipeRight={() => console.log("right")}
                />
              );
            }

            return (
              <SimpleCard
                key={row.id}
                row={row}
                dayCell={dayCell}
                onClick={() => onCellClick(row.id, row.name, null)}
              />
              // <TaskCard
              //   key={row.id}
              //   row={row}
              //   onTaskClick={() => onCellClick(row.id, row.name, null)}
              // />
            );
          })
        )}
      </div>
    </div>
  );
}

function TaskCard({ row, onTaskClick }: { row: Row; onTaskClick: () => void }) {
  return (
    <Card key={row.id} onClick={() => onTaskClick()}>
      <div className="flex w-full items-center gap-4">
        <UserAvatar initial={"J"} size={40} color="#ffd000" />
        <span className="text-[15px] font-semibold">Aufräumen</span>
        <div className="flex items-center ml-auto">
          <div className="h-8 w-8 flex items-center justify-center rounded-full border-2 border-green-400">
            <CheckIcon size={14} className="text-green-500" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function SimpleCard({
  row,
  dayCell,
  onClick,
}: {
  row: Row;
  dayCell: Row["cells"][number];
  onClick: () => void;
}) {
  const entry = dayCell[0];
  const isCompleted = entry.data?.isCompleted ?? false;
  const hasAssignee = !!entry.data?.assigneeName;
  const accentColor = isCompleted
    ? "#22c55e"
    : hasAssignee
      ? "#f97316"
      : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center gap-3 rounded-2xl border border-gray-100 bg-white pl-5 pr-4 py-3 shadow-xs text-left active:scale-[.99] transition-transform"
    >
      {accentColor && (
        <div
          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
          style={{ backgroundColor: accentColor }}
        />
      )}

      <div className="shrink-0">
        {hasAssignee ? (
          entry.data!.completerDiffers ? (
            <span className="flex items-center -space-x-2">
              <UserAvatar
                initial={entry.data!.assigneeName[0]}
                color={entry.data!.assigneeColor}
                completed={false}
                size={40}
              />
              <UserAvatar
                initial={entry.data!.completedByName![0]}
                color={entry.data!.completedByColor ?? "#22c55e"}
                completed={true}
                size={40}
              />
            </span>
          ) : (
            <UserAvatar
              initial={entry.data!.assigneeName[0]}
              color={entry.data!.assigneeColor}
              completed={isCompleted}
              size={40}
            />
          )
        ) : (
          <QuestionCircleIcon size={40} />
        )}
      </div>

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
                style={{ backgroundColor: entry.data!.assigneeColor }}
              />
              Übernommen
            </span>
          ) : (
            <span className="text-orange-500 font-medium">Noch offen</span>
          )}
        </span>
      </div>

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
}

interface SlottedCardProps {
  row: Row; // Ersetze "any" durch deinen echten 'Row'-Typ
  dayCell: Row["cells"][number]; // Ersetze durch deinen echten Typ
  onSlotClick: (slotId: string | null) => void;
  onSwipeLeft?: () => void; // Callback für Wischen nach links (z.B. Löschen/Archivieren)
  onSwipeRight?: () => void; // Callback für Wischen nach rechts (z.B. Abhaken)
}

function SlottedCard({
  row,
  dayCell,
  onSlotClick,
  onSwipeLeft,
  onSwipeRight,
}: SlottedCardProps) {
  const allDone = dayCell.every((e) => e.data?.isCompleted);
  const anyAssigned = dayCell.some((e) => e.data?.assigneeName);
  const accentColor = allDone ? "#22c55e" : anyAssigned ? "#f97316" : undefined;

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const minSwipeDistance = 60;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - touchStartY.current;

    if (
      Math.abs(diffX) > Math.abs(diffY) &&
      Math.abs(diffX) > minSwipeDistance
    ) {
      if (diffX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative flex items-center gap-3 rounded-2xl border border-gray-100 bg-white pl-5 pr-4 py-3 shadow-xs"
    >
      {accentColor && (
        <div
          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
          style={{ backgroundColor: accentColor }}
        />
      )}

      <div className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-slate-800 truncate">
          {row.name}
        </span>
      </div>

      <div className="shrink-0 flex gap-1.5">
        {dayCell.map((entry) => {
          const done = entry.data?.isCompleted;
          const assigned = !!entry.data?.assigneeName;
          return (
            <button
              key={entry.slotId}
              type="button"
              onClick={() => onSlotClick(entry.slotId)}
              className="active:scale-95 transition-transform"
              title={entry.label ?? ""}
            >
              {done ? (
                <div className="h-8 w-8 flex items-center justify-center rounded-full border-2 border-green-400">
                  <CheckIcon size={14} className="text-green-500" />
                </div>
              ) : assigned ? (
                <div className="h-8 w-8 flex items-center justify-center rounded-full border-2 border-orange-400">
                  <CheckIcon size={14} className="text-orange-500" />
                </div>
              ) : (
                <PlusCircleIcon size={32} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
