"use client";

import type { Row } from "@/types/plan";
import { formatDate } from "@/lib/dateUtils";
import TaskCell from "./taskCell";
import { shortenWeekDays } from "@/types";

type DesktopViewProps = {
  rows: Row[];
  weekDays: Date[];
  onCellClick: (taskId: string, taskName: string, slotId: string | null, dayIdx: number) => void;
};

export default function DesktopView({
  rows,
  weekDays,
  onCellClick,
}: DesktopViewProps) {
  return (
    <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full table-fixed">
        <colgroup>
          <col className="w-44" />
        </colgroup>

        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Aufgabe
            </th>
            {shortenWeekDays.map((day, i) => (
              <th key={i} className="py-3 text-center">
                <span
                  className={`block text-sm font-bold ${i >= 5 ? "text-slate-400" : "text-brand-600"}`}
                >
                  {day}
                </span>
                <span className="block text-xs text-slate-400">
                  {formatDate(weekDays[i])}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-8 text-center text-sm text-slate-400"
              >
                Noch keine Aufgaben vorhanden.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 last:border-b-0"
              >
                <td className="px-4 py-2.5">
                  <span
                    className="text-sm font-medium text-slate-800 wrap-break-word block"
                    style={{ lineHeight: "1.5" }}
                  >
                    {row.name}
                  </span>
                </td>
                {row.cells.map((cell, dayIdx) => (
                  <td key={dayIdx} className="p-1 align-middle">
                    <TaskCell
                      cell={cell}
                      onClick={(slotId) => onCellClick(row.id, row.name, slotId, dayIdx)}
                    />
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
