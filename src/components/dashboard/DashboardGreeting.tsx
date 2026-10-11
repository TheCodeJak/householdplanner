"use client";

import { dayProgress, greetingFor } from "@/lib/planText";
import type { TaskView } from "@/types/plan";
import { useSession } from "next-auth/react";

/**
 * Begrüßung ("Guten Abend, Jakob") und Fortschritt ("3/6 erledigt") über dem
 * Wochenstreifen. Scrollt normal mit weg, nur der Streifen darunter klebt.
 *
 * Hinweis: Die Tageszeit kommt aus der lokalen Uhr. Das Dashboard rendert erst
 * im Browser (useIsClient), sonst würde der Server (Docker = UTC) eine andere
 * Begrüßung erzeugen als der Browser → Hydration-Fehler.
 */
export function DashboardGreeting({ tasks }: { tasks: TaskView[] }) {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0];
  const { done, total } = dayProgress(tasks);

  return (
    <div className="flex items-center justify-between gap-3 px-5 pt-[max(1.75rem,env(safe-area-inset-top))]">
      <p className="text-2xl font-bold tracking-tight text-fg">
        {greetingFor(new Date())}
        {firstName && `, ${firstName}`}
      </p>
      {total > 0 && (
        <p className="shrink-0 rounded-full glass-pill px-3 py-1 text-xs font-semibold text-fg-2">
          {done}/{total} erledigt
        </p>
      )}
    </div>
  );
}
