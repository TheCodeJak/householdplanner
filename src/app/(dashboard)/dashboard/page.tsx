"use client";

import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { TaskListSkeleton } from "@/components/dashboard/TaskListSkeleton";
import { WeekStripHeader } from "@/components/dashboard/WeekStripHeader";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import { ErrorState } from "@/components/ui/ErrorState";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { useDayPlan } from "@/hooks/useDayPlan";
import { useIsClient } from "@/hooks/useIsClient";
import { useModalTarget } from "@/hooks/useModalTarget";
import { useSelectedDay } from "@/hooks/useSelectedDay";
import { toIsoDate } from "@/lib/dateUtils";
import type { SlotRef } from "@/types/plan";
// ⚠️ TEMPORÄR: Gruppierungs-Varianten, siehe ./_variants
import { DashboardVariants } from "./_variants/DashboardVariants";

// Die Seite setzt nur Hooks (Daten) und Komponenten (Darstellung) zusammen.
export default function DashboardPage() {
  const { date, isToday, shift, goToday } = useSelectedDay();
  const { tasks, isLoading, isPlaceholderData, hasData, error, refetch } =
    useDayPlan(date);
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
              <DashboardVariants
                tasks={tasks}
                onSelect={(taskId, slotId) =>
                  detail.openFor({ taskId, slotId, date: toIsoDate(date) })
                }
              />
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
