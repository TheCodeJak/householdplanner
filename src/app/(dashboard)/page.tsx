"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import NavButton from "../components/ui/navButton";
import { AvatarDot } from "../components/ui/avatarDot";
import { PlusDot } from "../components/ui/plusDot";
import { trpc } from "@/lib/trpc";
import CellModal, { type CellModalProps } from "../components/ui/CellModal";
import { colorFromUserId } from "@/lib/color";

// TODO: aus Session laden sobald familyId im JWT steht
const FAMILY_ID = "65183ae8-fc81-4228-97c5-dd3dd99c6322";

function getMonday(weekOffset: number): Date {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(d: Date): string {
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

function getWeekNumber(d: Date): number {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? null;

  const [weekOffset, setWeekOffset] = useState(0);
  const [modal, setModal] = useState<CellModalProps | null>(null);

  const monday = getMonday(weekOffset);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const { data: tasks } = trpc.tasks.getByFamily.useQuery({ familyId: FAMILY_ID });
  const { data: assignments } = trpc.assignments.getForWeek.useQuery({
    mondayDate: toIsoDate(monday),
    familyId: FAMILY_ID,
  });

  const utils = trpc.useUtils();

  const assignMutation = trpc.assignments.assign.useMutation({
    onSuccess: () => utils.assignments.getForWeek.invalidate(),
  });
  const unassignMutation = trpc.assignments.unassign.useMutation({
    onSuccess: () => utils.assignments.getForWeek.invalidate(),
  });

  type Cell = {
    assignmentId: string;
    assigneeName: string;
    assigneeColor: string;
    isCompleted: boolean;
    isCurrentUser: boolean;
    note: string | null;
  } | null;

  type Row = { id: string; name: string; cells: Cell[] };

  const assignmentMap = new Map(
    (assignments ?? []).map((a) => [`${a.taskId}_${a.date}`, a]),
  );

  const rows: Row[] = (tasks ?? []).map((task) => ({
    id: task.id,
    name: task.title,
    cells: weekDays.map((day) => {
      const a = assignmentMap.get(`${task.id}_${toIsoDate(day)}`);
      if (!a) return null;
      return {
        assignmentId: a.assignmentId,
        assigneeName: a.assigneeName,
        assigneeColor: colorFromUserId(a.assignedToId),
        isCompleted: a.completedAt !== null,
        isCurrentUser: a.assignedToId === currentUserId,
        note: a.notes,
      };
    }),
  }));

  return (
    <div className="text-2xl font-semibold text-zinc-900">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Kalenderwoche {getWeekNumber(monday)}
          </p>
          <div className="mt-1 flex items-center gap-3">
            <NavButton onClick={() => setWeekOffset((o) => o - 1)} dir="left" />
            <span className="text-xl font-semibold text-slate-800">
              {formatDate(weekDays[0])} – {formatDate(weekDays[6])}
              {weekDays[6].getFullYear()}
            </span>
            <NavButton onClick={() => setWeekOffset((o) => o + 1)} dir="right" />
          </div>
        </div>

        <button
          onClick={() => {/* TODO: Aufgabe erstellen */}}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Neue Aufgabe
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-44" />
          </colgroup>

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Aufgabe
              </th>
              {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day, i) => (
                <th key={i} className="py-3 text-center">
                  <span className={`block text-sm font-bold ${i >= 5 ? "text-slate-400" : "text-indigo-600"}`}>
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
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">
                  Noch keine Aufgaben vorhanden.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-2.5">
                    <span className="whitespace-nowrap text-sm font-medium text-slate-800">
                      {row.name}
                    </span>
                  </td>

                  {row.cells.map((cell, dayIdx) => (
                    <td key={dayIdx} className="p-1 align-middle">
                      <button
                        type="button"
                        onClick={() =>
                          setModal({
                            taskName: row.name,
                            cell,
                            weekDay: weekDays[dayIdx],
                            onClose: () => setModal(null),
                            onAssign: () =>
                              assignMutation.mutate({
                                taskId: row.id,
                                date: toIsoDate(weekDays[dayIdx]),
                              }),
                            onUnassign: cell?.assignmentId
                              ? () =>
                                  unassignMutation.mutate({
                                    assignmentId: cell.assignmentId!,
                                  })
                              : undefined,
                          })
                        }
                        className="flex w-full items-center justify-center gap-1 rounded-lg px-1 py-1.5 transition hover:bg-indigo-50 active:scale-95"
                      >
                        {cell?.assigneeName ? (
                          <AvatarDot
                            name={cell.assigneeName}
                            color={cell.assigneeColor ?? "#94a3b8"}
                            completed={cell.isCompleted}
                          />
                        ) : (
                          <PlusDot />
                        )}
                      </button>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal && <CellModal {...modal} />}
    </div>
  );
}
