import { trpc } from "@/lib/trpc";
import type { TaskIconName, TaskIconTone } from "@/lib/taskIcons";
import type { CategoryOption } from "@/types/profile";

/**
 * Alle Kategorien der Familie (auch leere) für die Profilseite und die
 * Auswahl im Aufgaben-Formular. React Query hält sie im Cache.
 */
export function useCategories() {
  const { data, isLoading, error, refetch } = trpc.categories.list.useQuery();
  return {
    categories: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Anlegen, Ändern und Löschen von Kategorien als Mutationen. `onSuccess` läuft
 * nur bei Erfolg, z.B. um das Sheet zu schließen oder die neue Kategorie
 * auszuwählen.
 */
export function useCategoryActions() {
  const utils = trpc.useUtils();
  // Nach jeder Änderung (Erfolg oder Fehler) Kategorien, Vorlagenliste und
  // Tagesplan als veraltet markieren: Name und Farbe erscheinen überall neu.
  // Das Promise bewusst NICHT zurückgeben (wie in useTaskTemplateActions).
  const options = {
    onSettled: () => {
      void utils.categories.list.invalidate();
      void utils.tasks.list.invalidate();
      void utils.plan.getDay.invalidate();
    },
  };

  const create = trpc.categories.create.useMutation(options);
  const update = trpc.categories.update.useMutation(options);
  const remove = trpc.categories.delete.useMutation(options);
  const all = [create, update, remove];

  return {
    create: (
      input: { name: string; tone: TaskIconTone; icon: TaskIconName | null },
      onSuccess: (created: CategoryOption) => void,
    ) => create.mutate(input, { onSuccess }),
    update: (
      input: {
        id: string;
        name: string;
        tone: TaskIconTone;
        icon: TaskIconName | null;
      },
      onSuccess: () => void,
    ) => update.mutate(input, { onSuccess }),
    remove: (id: string, onSuccess: () => void) =>
      remove.mutate({ id }, { onSuccess }),
    isPending: all.some((m) => m.isPending),
    // Der ganze Fehler (nicht nur der Text), damit describeError() ihn einordnen kann
    error: all.find((m) => m.error)?.error ?? null,
    reset: () => all.forEach((m) => m.reset()),
  };
}
