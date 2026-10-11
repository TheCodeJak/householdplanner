"use client";

import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { TaskCardList } from "@/components/dashboard/TaskCardList";
import { WeekStripHeader } from "@/components/dashboard/WeekStripHeader";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import { useDayPlan } from "@/hooks/useDayPlan";
import { useIsClient } from "@/hooks/useIsClient";
import { useModalTarget } from "@/hooks/useModalTarget";
import { useSelectedDay } from "@/hooks/useSelectedDay";
import { toIsoDate } from "@/lib/dateUtils";
import type { SlotRef } from "@/types/plan";

// Die Seite setzt nur Hooks (Daten) und Komponenten (Darstellung) zusammen.
export default function DashboardPage() {
  const { date, isToday, shift, goToday } = useSelectedDay();
  const { tasks, isLoading, error } = useDayPlan(date);
  const detail = useModalTarget<SlotRef>();
  // "Heute", die Begrüßung usw. hängen von der lokalen Uhrzeit ab. Der Server
  // (Docker = UTC) kennt die Zeitzone des Browsers nicht – deshalb rendern wir
  // erst im Browser, sonst passt das Server-HTML nicht zum Browser (Hydration-Fehler).
  const isClient = useIsClient();
  if (!isClient) return null;

  return (
    <>
      <DashboardGreeting tasks={tasks} />
      <WeekStripHeader
        date={date}
        isToday={isToday}
        onShift={shift}
        goToday={goToday}
      />

      <div className="m-4 flex flex-col gap-2">
        {isLoading ? (
          <p className="m-4 text-sm text-subtle">lädt …</p>
        ) : error ? (
          <p className="m-4 text-sm text-red-600 dark:text-red-400">
            {error.message}
          </p>
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
