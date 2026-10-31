import { trpc } from "@/lib/trpc";
import type { TaskDraft, TaskTemplate } from "@/types/profile";

/**
 * Alle Aufgaben-Vorlagen der Familie (aktive und archivierte) für die
 * Profilseite. React Query hält sie im Cache und lädt nach Änderungen neu.
 */
export function useTaskTemplates() {
  const { data, isLoading, error, refetch } = trpc.tasks.list.useQuery();
  return {
    tasks: data ?? [],
    isLoading,
    error,
    refetch,
    // Gibt es schon echte Daten? Dann blockiert ein Fehler beim Nachladen
    // nicht die ganze Liste.
    hasData: data !== undefined,
  };
}

/**
 * Anlegen, Ändern, Archivieren und Zurückholen von Vorlagen als Mutationen.
 * `save` legt an (task = null) oder ändert; `onSuccess` läuft nur bei Erfolg,
 * z.B. um das Sheet zu schließen.
 */
export function useTaskTemplateActions() {
  const utils = trpc.useUtils();
  // Nach jeder Änderung (Erfolg oder Fehler) Liste, Tagesplan und Kategorien
  // als veraltet markieren: React Query lädt sie neu, Profil und Dashboard
  // zeigen den neuen Stand. Das Promise bewusst NICHT zurückgeben (wie in
  // useAssignmentActions): sonst gilt die Mutation erst nach dem Neuladen als
  // fertig, und "Speichert …" bliebe unnötig lange stehen.
  const options = {
    onSettled: () => {
      void utils.tasks.list.invalidate();
      void utils.plan.getDay.invalidate();
      // Die Zahl der Aufgaben je Kategorie (Warnung beim Löschen) ändert sich mit
      void utils.categories.list.invalidate();
    },
  };

  const add = trpc.tasks.add.useMutation(options);
  const update = trpc.tasks.update.useMutation(options);
  const setActive = trpc.tasks.setActive.useMutation(options);
  const all = [add, update, setActive];

  function save(
    task: TaskTemplate | null,
    draft: TaskDraft,
    onSuccess: () => void,
  ) {
    if (task === null) {
      // add erwartet "nicht angegeben" statt leerer Texte
      add.mutate(
        {
          title: draft.title,
          description: draft.description || undefined,
          categoryId: draft.categoryId,
          icon: draft.icon ?? undefined,
          slots: draft.slots.map((slot) => slot.label),
        },
        { onSuccess },
      );
      return;
    }
    update.mutate(
      {
        taskId: task.id,
        title: draft.title,
        description: draft.description || null,
        categoryId: draft.categoryId,
        icon: draft.icon,
        slots: draft.slots,
      },
      { onSuccess },
    );
  }

  return {
    save,
    archive: (task: TaskTemplate, onSuccess: () => void) =>
      setActive.mutate({ taskId: task.id, isActive: false }, { onSuccess }),
    restore: (task: TaskTemplate) =>
      setActive.mutate({ taskId: task.id, isActive: true }),
    isPending: all.some((m) => m.isPending),
    // Der ganze Fehler (nicht nur der Text), damit describeError() ihn einordnen kann
    error: all.find((m) => m.error)?.error ?? null,
    reset: () => all.forEach((m) => m.reset()),
  };
}
