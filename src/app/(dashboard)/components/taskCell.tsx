"use client";

import { UserAvatar } from "../../components/shared/userAvatar";
import { AddButton } from "../../components/shared/addButton";
import type { Cell } from "@/types/plan";

type TaskCellProps = {
  cell: Cell;
  onClick: () => void;
};

export default function TaskCell({ cell, onClick }: TaskCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1 rounded-lg px-1 py-1.5 transition hover:bg-brand-50 active:scale-95"
    >
      {cell?.assigneeName ? (
        cell.completerDiffers ? (
          <span className="flex items-center -space-x-2">
            <UserAvatar
              initial={cell.assigneeName[0]}
              color={cell.assigneeColor ?? "#94a3b8"}
              completed={false}
            />
            <UserAvatar
              initial={cell.completedByName![0]}
              color={cell.completedByColor ?? "#22c55e"}
              completed={true}
            />
          </span>
        ) : (
          <UserAvatar
            initial={cell.assigneeName[0]}
            color={cell.assigneeColor ?? "#94a3b8"}
            completed={cell.isCompleted}
          />
        )
      ) : (
        <AddButton />
      )}
    </button>
  );
}
