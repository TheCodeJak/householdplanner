"use client";

import DayNavigator from "@/app/components/dashboard/DayNavigator";
import { TaskCardList } from "@/app/components/dashboard/TaskCardList";
import TaskDetailModal from "@/app/components/shared/TaskDetailModal";
import { useDayPlan } from "@/hooks/useDayPlan";
import { useModalTarget } from "@/hooks/useModalTarget";
import { useSelectedDay } from "@/hooks/useSelectedDay";
import { toIsoDate } from "@/lib/dateUtils";
import { SlotRef } from "@/types/plan";

export default function DashboardPage() {
  const { date, isToday, shift, goToday } = useSelectedDay();
  const { tasks, isLoading, error } = useDayPlan(date);
  const detail = useModalTarget<SlotRef>();

  return (
    <>
      <DayNavigator
        date={date}
        isToday={isToday}
        onShift={shift}
        goToday={goToday}
      />

      <div className="flex flex-col m-4 gap-2">
        {isLoading ? (
          <p className="m-4 text-sm text-slate-400">lädt …</p>
        ) : error ? (
          <p className="m-4 text-sm text-red-600">{error.message}</p>
        ) : (
          <TaskCardList
            tasks={tasks}
            onSelect={(taskId, slotId) =>
              detail.openFor({ taskId, slotId, date: toIsoDate(date) })
            }
          />
        )}
      </div>

      {detail.target && (
        <TaskDetailModal
          open={detail.isOpen}
          onClose={detail.close}
          target={detail.target}
        />
      )}
    </>
  );
}
