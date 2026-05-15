"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { colorFromUserId } from "@/lib/color";
import {
  getMonday,
  toIsoDate,
  formatDate,
  getWeekNumber,
} from "@/lib/dateUtils";
import { AddIcon, HomeIcon, NotificationIcon } from "../components/icons";
import { Button } from "../components/common/button";
import { AvatarDot, PlusDot } from "../components/common";
import NavButton from "../components/layout/navButton";
import CellModal from "../components/common/cellModal";
import TaskModal from "../components/common/taskModal";
import Image from "next/image";
import { AddButton, UserAvatar } from "../components/common/new";

// TODO: aus Session laden sobald familyId im JWT steht
export const FAMILY_ID = "65183ae8-fc81-4228-97c5-dd3dd99c6322";

export default function DashboardPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? null;

  const todayDayIdx = (new Date().getDay() + 6) % 7;
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIdx, setSelectedDayIdx] = useState(todayDayIdx);
  const [modal, setModal] = useState<{
    taskId: string;
    taskName: string;
    dayIdx: number;
  } | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monday = getMonday(weekOffset);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const { data: tasks } = trpc.tasks.getByFamily.useQuery({
    familyId: FAMILY_ID,
  });
  const { data: assignments } = trpc.assignments.getForWeek.useQuery({
    mondayDate: toIsoDate(monday),
    familyId: FAMILY_ID,
  });

  const utils = trpc.useUtils();

  const assignMutation = trpc.assignments.assign.useMutation({
    onSuccess: () => utils.assignments.getForWeek.invalidate(),
    onError: (err) => alert(err.message),
  });
  const unassignMutation = trpc.assignments.unassign.useMutation({
    onSuccess: () => utils.assignments.getForWeek.invalidate(),
  });
  const completeMutation = trpc.assignments.complete.useMutation({
    onSuccess: () => utils.assignments.getForWeek.invalidate(),
  });
  const uncompleteMutation = trpc.assignments.uncomplete.useMutation({
    onSuccess: () => utils.assignments.getForWeek.invalidate(),
  });

  type Cell = {
    assignmentId: string;
    assigneeName: string;
    assigneeColor: string;
    assignedToId: string;
    isCompleted: boolean;
    isCurrentUser: boolean;
    completedByName: string | null;
    completedByColor: string | null;
    isCompletedByCurrentUser: boolean;
    completerDiffers: boolean;
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
      const isCompleted = a.completedAt !== null;
      const completerDiffers =
        isCompleted &&
        a.completedById !== null &&
        a.completedById !== a.assignedToId;
      return {
        assignmentId: a.assignmentId,
        assigneeName: a.assigneeName,
        assigneeColor: colorFromUserId(a.assignedToId),
        assignedToId: a.assignedToId,
        isCompleted,
        isCurrentUser: a.assignedToId === currentUserId,
        completedByName: a.completedByName ?? null,
        completedByColor: a.completedById
          ? colorFromUserId(a.completedById)
          : null,
        isCompletedByCurrentUser:
          a.completedById !== null && a.completedById === currentUserId,
        completerDiffers,
        note: a.notes,
      };
    }),
  }));

  return (
    <div className="shadow-md group border border-gray-100 rounded-2xl p-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex gap-4 items-center">
          {/* <HomeIcon size={18} className="text-brand-600 drop-shadow-sm" /> */}
          <Image src="\icon.svg" width={32} height={32} alt="" priority />
          <h1 className="font-semibold text-xl text-gray-800">
            Household Planner
          </h1>
        </div>

        <div className="flex gap-4 items-center">
          <NotificationIcon
            size={18}
            className="text-gray-400 hover:text-brand-600 transition-colors cursor-pointer"
          />
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors"
            >
              <p className="text-gray-700">{session?.user?.name}</p>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M2 4.5l4.5 5 4.5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  color="gray"
                />
              </svg>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-1 w-40 rounded-xl border border-gray-100 bg-white py-1 shadow-lg z-50">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Abmelden
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-gray-200 rounded-full my-4" />

      <div className="flex flex-col gap-y-4 text-2xl font-semibold text-zinc-900">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-600">
          Kalenderwoche {getWeekNumber(monday)}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <NavButton onClick={() => { setWeekOffset((o) => o - 1); setSelectedDayIdx(0); }} dir="left" />
            <span className="w-55 text-center text-xl font-semibold text-slate-800">
              {formatDate(weekDays[0])} – {formatDate(weekDays[6])}
              {weekDays[6].getFullYear()}
            </span>
            <NavButton
              onClick={() => { setWeekOffset((o) => o + 1); setSelectedDayIdx(0); }}
              dir="right"
            />
          </div>

          <Button
            onClick={() => setTaskModalOpen(true)}
            className="flex items-center gap-2 shadow-sm"
          >
            <AddIcon />
            Neue Aufgabe
          </Button>
        </div>

        {/* Mobile: Tagesansicht */}
        <div className="md:hidden">
          <div className="flex rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-4">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day, i) => {
              const isToday = weekOffset === 0 && i === todayDayIdx;
              const isSelected = i === selectedDayIdx;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDayIdx(i)}
                  className={`flex-1 flex flex-col items-center py-2.5 text-xs font-semibold transition-colors
                    ${isSelected ? "bg-brand-600 text-white" : isToday ? "text-brand-600" : i >= 5 ? "text-slate-400" : "text-slate-600"}
                    ${isSelected ? "" : "hover:bg-slate-50"}`}
                >
                  <span>{day}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? "text-brand-100" : "text-slate-400"}`}>
                    {formatDate(weekDays[i])}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            {rows.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Noch keine Aufgaben vorhanden.</p>
            ) : (
              rows.map((row) => {
                const cell = row.cells[selectedDayIdx];
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setModal({ taskId: row.id, taskName: row.name, dayIdx: selectedDayIdx })}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:bg-brand-50 transition-colors active:scale-[0.98]"
                  >
                    <span className="text-sm font-medium text-slate-800">{row.name}</span>
                    {cell?.assigneeName ? (
                      cell.completerDiffers ? (
                        <span className="flex items-center -space-x-2">
                          <UserAvatar initial={cell.assigneeName[0]} color={cell.assigneeColor ?? "#94a3b8"} completed={false} />
                          <UserAvatar initial={cell.completedByName![0]} color={cell.completedByColor ?? "#22c55e"} completed={true} />
                        </span>
                      ) : (
                        <UserAvatar initial={cell.assigneeName[0]} color={cell.assigneeColor ?? "#94a3b8"} completed={cell.isCompleted} />
                      )
                    ) : (
                      <AddButton />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Desktop: Wochenübersicht */}
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
                {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day, i) => (
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
                        <button
                          type="button"
                          onClick={() =>
                            setModal({
                              taskId: row.id,
                              taskName: row.name,
                              dayIdx,
                            })
                          }
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
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
      {modal &&
        (() => {
          const row = rows.find((r) => r.id === modal.taskId);
          const liveCell = row?.cells[modal.dayIdx] ?? null;
          return (
            <CellModal
              taskName={modal.taskName}
              cell={liveCell}
              weekDay={weekDays[modal.dayIdx]}
              onClose={() => setModal(null)}
              onAssign={() =>
                assignMutation.mutate({
                  taskId: modal.taskId,
                  date: toIsoDate(weekDays[modal.dayIdx]),
                })
              }
              onUnassign={
                liveCell?.assignmentId
                  ? () =>
                      unassignMutation.mutate({
                        assignmentId: liveCell.assignmentId!,
                      })
                  : undefined
              }
              onComplete={
                liveCell?.assignmentId
                  ? () =>
                      completeMutation.mutate({
                        assignmentId: liveCell.assignmentId!,
                      })
                  : undefined
              }
              onUncomplete={
                liveCell?.assignmentId
                  ? () =>
                      uncompleteMutation.mutate({
                        assignmentId: liveCell.assignmentId!,
                      })
                  : undefined
              }
            />
          );
        })()}
      {taskModalOpen && <TaskModal onClose={() => setTaskModalOpen(false)} />}
    </div>
  );
}
