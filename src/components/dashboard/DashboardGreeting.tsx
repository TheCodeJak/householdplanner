"use client";

import { dayProgress, greetingFor } from "@/lib/planText";
import type { TaskView } from "@/types/plan";
import { useSession } from "next-auth/react";
import { MineFilter } from "./MineFilter";

/**
 * Kompakter Kopf: Begrüßung ("Guten Abend, Jakob") mit dem Filter „Alle |
 * Meine“ daneben, darunter der Tagesfortschritt als schlanke Linie mit "6/14".
 * Scrollt normal mit weg, nur der Streifen darunter klebt.
 *
 * Hinweis: Die Tageszeit kommt aus der lokalen Uhr. Das Dashboard rendert erst
 * im Browser (useIsClient), sonst würde der Server (läuft in UTC) eine andere
 * Begrüßung erzeugen als der Browser → Hydration-Fehler.
 */
export function DashboardGreeting({
  tasks,
  mineCount,
  mineOnly,
  onMineOnlyChange,
}: {
  /** Alle Aufgaben des Tages (der Fortschritt zählt immer den ganzen Tag) */
  tasks: TaskView[];
  mineCount: number;
  mineOnly: boolean;
  onMineOnlyChange: (mineOnly: boolean) => void;
}) {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0];
  const { done, total } = dayProgress(tasks);
  const allDone = total > 0 && done === total;

  return (
    <div className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-title font-bold tracking-tight text-fg">
          {greetingFor(new Date())}
          {firstName && `, ${firstName}`}
        </p>
        <MineFilter
          mineOnly={mineOnly}
          mineCount={mineCount}
          onChange={onMineOnlyChange}
        />
      </div>

      {total > 0 && (
        <div className="mt-2.5 flex items-center gap-3">
          {/* Spur und Füllung; fertig wird die Linie grün */}
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/12"
            role="img"
            aria-label={`${done} von ${total} erledigt`}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${
                allDone ? "bg-success-600" : "bg-primary"
              }`}
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
          <span className="text-caption font-semibold text-muted tabular-nums">
            {done}/{total}
          </span>
        </div>
      )}
    </div>
  );
}
