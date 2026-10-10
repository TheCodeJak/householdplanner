"use client";

import { UserAvatar } from "@/app/components/shared/userAvatar";
import { AddButton } from "@/app/components/shared/addButton";
import type { DayCell } from "@/types/plan";

type TaskCellProps = {
  cell: DayCell;
  onClick: (slotId: string | null) => void;
};

export default function TaskCell({ cell, onClick }: TaskCellProps) {
  const hasSlots = cell.length > 1;

  if (!hasSlots) {
    const entry = cell[0];
    return (
      <button
        type="button"
        onClick={() => onClick(null)}
        className="flex w-full items-center justify-center gap-1 rounded-lg px-1 py-1.5 transition hover:bg-brand-50 active:scale-95"
      >
        {entry.data?.assigneeName ? (
          entry.data.completerDiffers ? (
            <span className="flex items-center -space-x-2">
              <UserAvatar
                initial={entry.data.assigneeName[0]}
                color={entry.data.assigneeColor ?? "#94a3b8"}
                completed={false}
              />
              <UserAvatar
                initial={entry.data.completedByName![0]}
                color={entry.data.completedByColor ?? "#22c55e"}
                completed={true}
              />
            </span>
          ) : (
            <UserAvatar
              initial={entry.data.assigneeName[0]}
              color={entry.data.assigneeColor ?? "#94a3b8"}
              completed={entry.data.isCompleted}
            />
          )
        ) : (
          <AddButton />
        )}
      </button>
    );
  }

  // Multi-slot: each indicator is its own button
  return (
    <div className="flex items-center justify-center gap-0.5 px-1 py-1.5">
      {cell.map((entry) => {
        const short = (entry.label ?? "").slice(0, 2);
        if (entry.data?.isCompleted) {
          return (
            <button
              key={entry.slotId}
              type="button"
              onClick={() => onClick(entry.slotId)}
              title={entry.label ?? ""}
              className="flex flex-col items-center w-6 rounded hover:bg-green-50 transition active:scale-95"
            >
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="text-[8px] text-green-600 font-semibold mt-0.5">{short}</span>
            </button>
          );
        }
        if (entry.data?.assigneeName) {
          return (
            <button
              key={entry.slotId}
              type="button"
              onClick={() => onClick(entry.slotId)}
              title={entry.label ?? ""}
              className="flex flex-col items-center w-6 rounded hover:bg-orange-50 transition active:scale-95"
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.data.assigneeColor }}
              />
              <span className="text-[8px] text-muted font-medium mt-0.5">{short}</span>
            </button>
          );
        }
        return (
          <button
            key={entry.slotId}
            type="button"
            onClick={() => onClick(entry.slotId)}
            title={entry.label ?? ""}
            className="flex flex-col items-center w-6 rounded hover:bg-surface-2 transition active:scale-95"
          >
            <span className="h-3 w-3 rounded-full border border-line" />
            <span className="text-[8px] text-subtle mt-0.5">{short}</span>
          </button>
        );
      })}
    </div>
  );
}
