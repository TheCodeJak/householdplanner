import { toIsoDate } from "@/lib/dateUtils";
import { trpc } from "@/lib/trpc";
import { keepPreviousData } from "@tanstack/react-query";

/**
 * Alle Aufgaben eines Tages als fertige TaskView[] vom Server (plan.getDay).
 *
 * React Query speichert das Ergebnis pro Datum im Cache: Wechselt man zurück
 * auf einen Tag, erscheint er sofort. Mehrere Komponenten mit demselben Datum
 * (Dashboard + Detail-Sheet) teilen sich dieselbe Anfrage.
 */
export function useDayPlan(date: Date) {
  const { data, isLoading, error } = trpc.plan.getDay.useQuery(
    {
      date: toIsoDate(date),
    },
    {
      // Beim Tageswechsel die alten Karten zeigen, bis die neuen da sind –
      // statt kurz "lädt …" und einem leeren Bildschirm
      placeholderData: keepPreviousData,
      // Alle 20 s im Hintergrund neu laden: Änderungen anderer
      // Familienmitglieder erscheinen ohne Neuladen der Seite
      refetchInterval: 20_000,
    },
  );
  return { tasks: data ?? [], isLoading, error };
}
