"use client";

import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { TaskGroupList } from "@/components/dashboard/TaskGroupList";
import { WeekStripHeader } from "@/components/dashboard/WeekStripHeader";
import { TaskListSkeleton } from "@/components/ui/TaskListSkeleton";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import { ErrorState } from "@/components/ui/ErrorState";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { useDayPlan } from "@/hooks/useDayPlan";
import { useIsClient } from "@/hooks/useIsClient";
import { useMineOnly } from "@/hooks/useMineOnly";
import { useModalTarget } from "@/hooks/useModalTarget";
import { useSelectedDay } from "@/hooks/useSelectedDay";
import { toIsoDate } from "@/lib/dateUtils";
import { countMine, onlyMine } from "@/lib/mine";
import type { SlotRef } from "@/types/plan";

// Die Seite setzt nur Hooks (Daten) und Komponenten (Darstellung) zusammen.
export default function DashboardPage() {
  const { date, isToday, shift, goToday } = useSelectedDay();
  const { tasks, isLoading, isPlaceholderData, hasData, error, refetch } =
    useDayPlan(date);
  const detail = useModalTarget<SlotRef>();
  const [mineOnly, setMineOnly] = useMineOnly();
  // "Heute", die Begrüßung usw. hängen von der lokalen Uhrzeit ab. Der Server
  // (läuft in UTC) kennt die Zeitzone des Browsers nicht – deshalb rendern wir
  // erst im Browser, sonst passt das Server-HTML nicht zum Browser (Hydration-Fehler).
  const isClient = useIsClient();
  if (!isClient) return null;

  const visible = mineOnly ? onlyMine(tasks) : tasks;

  return (
    <>
      <DashboardGreeting
        tasks={tasks}
        mineCount={countMine(tasks)}
        mineOnly={mineOnly}
        onMineOnlyChange={setMineOnly}
      />
      <WeekStripHeader
        date={date}
        isToday={isToday}
        onShift={shift}
        goToday={goToday}
      />

      <div className="m-4 flex flex-col gap-2">
        {isLoading ? (
          // Allererstes Laden: Platzhalter-Karten statt Text
          <TaskListSkeleton />
        ) : error && !hasData ? (
          // Fehler und noch nichts anzuzeigen: ganzseitige Meldung
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : (
          <>
            {/* Fehler beim Nachladen im Hintergrund: der letzte Stand bleibt
                sichtbar, oben nur ein kleiner Hinweis */}
            {error && (
              <div className="mx-2">
                <InlineAlert
                  text="Verbindung unterbrochen – du siehst den letzten Stand."
                  actionLabel="Erneut versuchen"
                  onAction={() => refetch()}
                />
              </div>
            )}
            {/* Beim Tageswechsel stehen kurz noch die Karten des vorigen Tages
                da (keepPreviousData) – blasser, damit klar ist: es lädt */}
            <div
              className={`transition-opacity duration-200 ${
                isPlaceholderData ? "opacity-50" : ""
              }`}
            >
              {mineOnly && visible.length === 0 ? (
                <div className="m-2 flex flex-col items-center gap-2 py-6 text-center">
                  <p className="text-secondary text-subtle">
                    Dir ist an diesem Tag nichts zugewiesen.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMineOnly(false)}
                    className="min-h-10 px-3 text-secondary font-semibold text-primary-hover"
                  >
                    Alle anzeigen
                  </button>
                </div>
              ) : (
                <TaskGroupList
                  tasks={visible}
                  onSelect={(taskId, slotId) =>
                    detail.openFor({ taskId, slotId, date: toIsoDate(date) })
                  }
                />
              )}
            </div>
          </>
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
