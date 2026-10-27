"use client";

import { IconButton } from "@/components/ui/IconButton";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { PersonChip } from "@/components/ui/PersonChip";
import { StatusPill } from "@/components/ui/StatusPill";
import { TaskTile } from "@/components/ui/TaskTile";
import { useAssignmentActions } from "@/hooks/useAssignmentActions";
import { useDayPlan } from "@/hooks/useDayPlan";
import { formatDayLabel, fromIsoDate } from "@/lib/dateUtils";
import { describeError } from "@/lib/describeError";
import { fitsSideBySide, getSlotActions } from "@/lib/getSlotActions";
import { TASK_ICON_GLOWS, taskIconTones } from "@/lib/taskIcons";
import type { SlotRef, SlotView } from "@/types/plan";
import { Button, Modal } from "jaklib/core";

/**
 * Detail-Sheet einer Aufgabe bzw. eines Slots, öffnet sich von unten.
 *
 * Bekommt nur das Ziel (`target`), keine Daten und keine Callbacks: Den Slot
 * liest es selbst aus dem Cache von useDayPlan, die Aktionen laufen über
 * useAssignmentActions. Danach lädt React Query den Tag neu, und Karte und
 * Sheet zeigen automatisch den neuen Stand.
 *
 * Aussehen: jaklibs Modal mit der Klasse `.task-sheet` (globals.css) – schwebend,
 * rundum abgerundet, ohne jaklibs eigenen Kopf. Den Kopf bauen wir hier farbig.
 */
export default function TaskDetailModal({
  open,
  onClose,
  target,
}: {
  open: boolean;
  onClose: () => void;
  target: SlotRef;
}) {
  const day = fromIsoDate(target.date);
  const { tasks } = useDayPlan(day);
  const { run, isPending, error, reset } = useAssignmentActions();

  const task = tasks.find((t) => t.taskId === target.taskId);
  const slot = task?.slots.find((s) => s.slotId === target.slotId);
  if (!task || !slot) return null;

  const actions = getSlotActions(slot);
  // Verlauf in der Farbe der Aufgabe, z.B. "from-sky-100" (siehe taskIcons.ts)
  const glow = TASK_ICON_GLOWS[task.icon ? taskIconTones[task.icon] : "slate"];

  function close() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      variant="sheet"
      className="task-sheet"
      aria-label={task.title}
    >
      {/* Kopf: bg-linear-to-b + from-…-100 + to-transparent = Verlauf von oben
          (Aufgabenfarbe) nach unten (durchsichtig). pt-7 lässt Platz für den
          Zieh-Griff von jaklib, der darüberliegt. */}
      <div
        className={`flex items-center gap-2.5 bg-linear-to-b to-transparent px-4 pt-7 pb-3 ${glow}`}
      >
        <TaskTile
          icon={task.icon}
          title={task.title}
          completed={slot.status === "completed"}
        />
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 text-body leading-snug font-bold text-fg">
            {task.title}
          </h2>
          <p className="text-secondary text-muted">
            {formatDayLabel(day)}
            {slot.label && ` · ${slot.label}`}
          </p>
        </div>
        <StatusPill status={slot.status} />
        {/* Das X ist bewusst das erste Bedienelement: jaklib fokussiert beim
            Öffnen das erste davon – sonst läge der Fokus auf einer Aktion, und
            ein Tastendruck könnte sie versehentlich auslösen. */}
        <IconButton
          icon="close"
          label="Schließen"
          onClick={close}
          variant="plain"
        />
      </div>

      <div className="px-4 pb-4">
        <SlotPeople slot={slot} />

        {slot.notes && (
          <div className="mb-3 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-body leading-relaxed text-fg-2 dark:border-amber-500/20 dark:bg-amber-500/10">
            {slot.notes}
          </div>
        )}

        <div
          className={
            fitsSideBySide(actions)
              ? "grid grid-cols-2 gap-2"
              : "flex flex-col gap-2"
          }
        >
          {actions.map((action) => (
            <Button
              key={action.key}
              variant={action.variant}
              // min-w-0 + whitespace-nowrap: Text bleibt einzeilig, der Button
              // darf aber in seiner Grid-Spalte schmaler werden als der Text
              className="w-full min-w-0 px-3 text-secondary whitespace-nowrap"
              disabled={isPending}
              onClick={() => run(action.key, target, close)}
            >
              {action.label}
            </Button>
          ))}
        </div>
        {error && (
          <div className="mt-3">
            <InlineAlert text={describeError(error).text} />
          </div>
        )}
      </div>
    </Modal>
  );
}

/** Wer hat geplant / wer hat erledigt – kompakt in einer Zeile */
function SlotPeople({ slot }: { slot: SlotView }) {
  const { assignee, completedBy } = slot;
  if (!assignee) {
    return (
      <p className="mb-3 text-secondary text-subtle">
        Noch niemand eingeteilt.
      </p>
    );
  }

  const samePerson = completedBy?.id === assignee.id;
  return (
    <div className="mb-3 flex gap-2">
      {samePerson ? (
        <PersonChip label="Geplant und erledigt von" person={assignee} />
      ) : (
        <>
          <PersonChip label="Geplant von" person={assignee} />
          {completedBy && (
            <PersonChip label="Erledigt von" person={completedBy} />
          )}
        </>
      )}
    </div>
  );
}
