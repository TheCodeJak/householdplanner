"use client";

import { dayProgress, greetingFor } from "@/lib/planText";
import type { TaskView } from "@/types/plan";
import { useSession } from "next-auth/react";

/**
 * Begrüßung ("Guten Abend, Jakob") und Tagesfortschritt als Balken mit
 * "6 von 14 erledigt" und Prozent. Scrollt normal mit weg, nur der Streifen
 * darunter klebt.
 *
 * Hinweis: Die Tageszeit kommt aus der lokalen Uhr. Das Dashboard rendert erst
 * im Browser (useIsClient), sonst würde der Server (läuft in UTC) eine andere
 * Begrüßung erzeugen als der Browser → Hydration-Fehler.
 */
export function DashboardGreeting({ tasks }: { tasks: TaskView[] }) {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0];
  const { done, total } = dayProgress(tasks);
  const allDone = total > 0 && done === total;

  return (
    <div className="px-5 pt-[max(1.75rem,env(safe-area-inset-top))]">
      <p className="text-headline font-bold tracking-tight text-fg">
        {greetingFor(new Date())}
        {firstName && `, ${firstName}`}
      </p>

      {total > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-baseline justify-between">
            <p className="text-secondary text-muted">
              {allDone ? (
                "Alles erledigt"
              ) : (
                <>
                  <span className="text-body font-bold text-fg tabular-nums">
                    {done}
                  </span>{" "}
                  von {total} erledigt
                </>
              )}
            </p>
            <span className="text-secondary font-semibold text-muted tabular-nums">
              {Math.round((done / total) * 100)} %
            </span>
          </div>
          {/* Spur und Füllung; fertig wird der Balken grün */}
          <div
            className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/12"
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
        </div>
      )}
    </div>
  );
}
