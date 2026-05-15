"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { toIsoDate } from "@/lib/dateUtils";
import { NotificationIcon } from "../components/icons";
import CellModal from "../components/shared/cellModal";
import TaskModal from "../components/shared/taskModal";
import Image from "next/image";
import { useWeekPlan, FAMILY_ID } from "./hooks/useWeekPlan";
import WeekHeader from "./components/weekHeader";
import DayPicker from "./components/dayPicker";
import MobileView from "./components/mobileView";
import DesktopView from "./components/desktopView";
import { shortenWeekDays } from "@/types";
import BottomNav from "./components/bottomNav";

export { FAMILY_ID };

export default function DashboardPage() {
  const { data: session } = useSession();

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

  const {
    monday,
    weekDays,
    rows,
    assignMutation,
    unassignMutation,
    completeMutation,
    uncompleteMutation,
  } = useWeekPlan(weekOffset);

  return (
    <div className="flex flex-col w-full">
      <div className="border border-gray-200 border-t-0 p-5 shadow-sm z-10">
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-4 items-center">
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
      </div>

      {/* <div className="h-px w-full bg-gray-200 rounded-full my-4" /> */}

      {/* <div className="flex p-4 gap-x-1 w-full justify-center bg-[#FEF9F6]">
        {shortenWeekDays.map((day, i) => {
          const isSelected = selectedDayIdx === i;
          return (
            <button
              key={i}
              className={`flex flex-1 flex-col items-center justify-center border border-gray-200 rounded-3xl shadow-xs bg-white shrink-0 max-w-20 min-h-30 ${
                isSelected
                  ? "bg-linear-to-b from-orange-500 to-orange-400/50 scale-105"
                  : "bg-white border-gray-200 hover:bg-orange-50 text-stone-500"
              }`}
            >
              <span
                className={`font-semibold ${isSelected ? "text-white" : "text-stone-500"} `}
              >
                {day}
              </span>
              <span
                className={`font-bold text-3xl my-1 ${isSelected ? "text-white" : "text-stone-800"}`}
              >
                12
              </span>
              <span
                className={`text-xs ${isSelected ? "text-white/90" : "text-stone-500"}`}
              >
                Mai
              </span>
            </button>
          );
        })}
          bg-[#FEF9F6]
      </div> */}

      <div className="flex flex-col gap-y-4 text-2xl font-semibold text-zinc-900">
        <div className="flex flex-col bg-[#FEF9F6]">
          <WeekHeader
            monday={monday}
            weekDays={weekDays}
            weekOffset={weekOffset}
            onPrevWeek={() => {
              setWeekOffset((o) => o - 1);
              setSelectedDayIdx(0);
            }}
            onNextWeek={() => {
              setWeekOffset((o) => o + 1);
              setSelectedDayIdx(0);
            }}
            onToday={() => {
              setWeekOffset(0);
              setSelectedDayIdx(todayDayIdx);
            }}
            onNewTask={() => setTaskModalOpen(true)}
          />

          <div className="md:hidden">
            <DayPicker
              weekDays={weekDays}
              selectedDayIdx={selectedDayIdx}
              onSelect={setSelectedDayIdx}
            />
          </div>
        </div>

        <div className="md:hidden relative">
          <MobileView
            rows={rows}
            weekDays={weekDays}
            selectedDayIdx={selectedDayIdx}
            onCellClick={(taskId, taskName) =>
              setModal({ taskId, taskName, dayIdx: selectedDayIdx })
            }
          />
          <button
            type="button"
            onClick={() => setTaskModalOpen(true)}
            className="fixed bottom-22 right-6 h-14 w-14 flex items-center justify-center rounded-full bg-orange-500 text-white shadow-lg z-30 hover:bg-orange-600 active:scale-95 transition-all"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M11 3v16M3 11h16"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <DesktopView
          rows={rows}
          weekDays={weekDays}
          onCellClick={(taskId, taskName, dayIdx) =>
            setModal({ taskId, taskName, dayIdx })
          }
        />
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
              onQuickComplete={
                !liveCell
                  ? async () => {
                      const created = await assignMutation.mutateAsync({
                        taskId: modal.taskId,
                        date: toIsoDate(weekDays[modal.dayIdx]),
                      });
                      completeMutation.mutate({
                        assignmentId: created.id,
                      });
                    }
                  : undefined
              }
            />
          );
        })()}
      {taskModalOpen && <TaskModal onClose={() => setTaskModalOpen(false)} />}
      <div className="h-16 md:hidden" />
      <BottomNav />
    </div>
  );
}
