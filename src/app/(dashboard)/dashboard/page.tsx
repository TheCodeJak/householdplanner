"use client";

import DayNavigator from "@/app/components/dashboard/DayNavigator";
import MobileView from "@/app/components/dashboard/mobileView";
import { TaskCard } from "@/app/components/dashboard/TaskCard";
import { useWeekPlan } from "@/app/components/dashboard/useWeekPlan";
import CellModal from "@/app/components/shared/cellModal";
import TaskModal from "@/app/components/shared/taskModal";
import { toIsoDate } from "@/lib/dateUtils";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function DashboardPage() {
  const todayIndex = (new Date().getDay() + 6) % 7;
  const [weekOffset, setWeekOffset] = useState(0);
  const [dayOffset, setDayOffset] = useState(0);
  const [selectedDayIdx, setSelectedDayIdx] = useState(todayIndex);
  const [modal, setModal] = useState<{
    taskId: string;
    taskName: string;
    slotId: string | null;
    dayIdx: number;
  } | null>(null);
  const [cellModalOpen, setCellModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const {
    monday,
    weekDays,
    rows,
    assignMutation,
    unassignMutation,
    completeMutation,
    uncompleteMutation,
  } = useWeekPlan(weekOffset);

  // TEMP (Schritt 5): Rohdaten von plan.getDay ansehen
  const debugPlan = trpc.plan.getDay.useQuery(
    { date: toIsoDate(new Date()) },
    { retry: false },
  );

  return (
    <>
      <pre className="m-4 overflow-x-auto rounded-xl bg-slate-100 p-3 text-xs font-normal">
        {debugPlan.isLoading
          ? "lädt …"
          : debugPlan.error
            ? `${debugPlan.error.data?.code}: ${debugPlan.error.message}`
            : JSON.stringify(debugPlan.data, null, 2)}
      </pre>
      <DayNavigator
        dayOffset={dayOffset}
        onPrevDay={() => {
          setDayOffset((o) => o - 1);
          setSelectedDayIdx(0);
        }}
        onNextDay={() => {
          setDayOffset((o) => o + 1);
          setSelectedDayIdx(0);
        }}
        onToday={() => {
          setDayOffset(0);
          setSelectedDayIdx(todayIndex);
        }}
      />

      <MobileView
        rows={rows}
        weekDays={weekDays}
        selectedDayIdx={selectedDayIdx}
        onCellClick={(taskId, taskName, slotId) => {
          setModal({ taskId, taskName, slotId, dayIdx: selectedDayIdx });
          setCellModalOpen(true);
        }}
      />
      <div className="flex flex-col m-4 gap-2">
        <TaskCard
          title="Geschirrspüler ausräumen / einräumen"
          slots={[
            {
              status: "completed",
              assignee: { name: "Jakob", color: "#F28B4F" },
              completedBy: { name: "Lisa", color: "#4CAF82" },
            },
          ]}
        />
        <TaskCard
          title="Gassi gehen"
          slots={[
            {
              status: "completed",
              assignee: { name: "Jakob", color: "#F28B4F" },
              completedBy: { name: "Lisa", color: "#4CAF82" },
              slotTitle: "Morgens",
            },
            {
              status: "claimed",
              assignee: { name: "Jakob", color: "#F28B4F" },
              slotTitle: "Mittags",
            },
          ]}
        />
        <TaskCard
          title="Müll rausbringen"
          slots={[
            {
              status: "claimed",
              assignee: { name: "Jakob", color: "#F28B4F" },
            },
          ]}
        />
        <TaskCard
          title="Einkaufen"
          slots={[
            {
              status: "open",
            },
          ]}
        />
      </div>
      {/* <div className="flex flex-col gap-y-4 text-2xl font-semibold text-zinc-900">
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
            onCellClick={(taskId, taskName, slotId) => {
              setModal({ taskId, taskName, slotId, dayIdx: selectedDayIdx });
              setCellModalOpen(true);
            }}
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
          onCellClick={(taskId, taskName, slotId, dayIdx) => {
            setModal({ taskId, taskName, slotId, dayIdx });
            setCellModalOpen(true);
          }}
        />
      </div> */}

      {modal &&
        (() => {
          const row = rows.find((r) => r.id === modal.taskId);
          const dayCell = row?.cells[modal.dayIdx] ?? [];
          const entry = dayCell.find((e) => e.slotId === modal.slotId) ?? null;
          const liveCell = entry?.data ?? null;
          const taskLabel = entry?.label
            ? `${modal.taskName} (${entry.label})`
            : modal.taskName;

          return (
            <CellModal
              open={cellModalOpen}
              taskName={taskLabel}
              cell={liveCell}
              weekDay={weekDays[modal.dayIdx]}
              onClose={() => setCellModalOpen(false)}
              onAssign={() =>
                assignMutation.mutate({
                  taskId: modal.taskId,
                  date: toIsoDate(weekDays[modal.dayIdx]),
                  slotId: modal.slotId,
                })
              }
              onUnassign={
                liveCell?.assignmentId
                  ? () =>
                      unassignMutation.mutate({
                        assignmentId: liveCell.assignmentId,
                      })
                  : undefined
              }
              onComplete={
                liveCell?.assignmentId
                  ? () =>
                      completeMutation.mutate({
                        assignmentId: liveCell.assignmentId,
                      })
                  : undefined
              }
              onUncomplete={
                liveCell?.assignmentId
                  ? () =>
                      uncompleteMutation.mutate({
                        assignmentId: liveCell.assignmentId,
                      })
                  : undefined
              }
              onQuickComplete={
                !liveCell
                  ? async () => {
                      const created = await assignMutation.mutateAsync({
                        taskId: modal.taskId,
                        date: toIsoDate(weekDays[modal.dayIdx]),
                        slotId: modal.slotId,
                      });
                      completeMutation.mutate({ assignmentId: created.id });
                    }
                  : undefined
              }
            />
          );
        })()}
      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
    </>
  );
}
