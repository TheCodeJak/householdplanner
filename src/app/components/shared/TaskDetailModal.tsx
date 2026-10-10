"use client";

import { useAssignmentActions } from "@/hooks/useAssignmentActions";
import { useDayPlan } from "@/hooks/useDayPlan";
import { fromIsoDate, getDay } from "@/lib/dateUtils";
import { getSlotActions } from "@/lib/getSlotActions";
import { Person, SlotRef } from "@/types/plan";
import { Button, Modal } from "jaklib/core";
import { PersonDot } from "../ui/PersonDot";

// Schwebendes Sheet statt randlos: Abstand zum Rand wie die Bottom-Navigation,
// rundum abgerundet und mit etwas weniger Innenabstand als jaklibs Standard.
// (Die Utilities greifen, weil jaklibs CSS im Layer "components" liegt.)
const SHEET_CLASS = [
  "mx-3 mb-[max(0.75rem,env(safe-area-inset-bottom))] w-[min(calc(100%-1.5rem),32rem)]",
  "[--space-5:1rem]",
  "[&>div]:rounded-3xl [&>div]:border-b [&>div]:pb-0 [&>div]:shadow-2xl",
].join(" ");

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-subtle">
        {label}
      </p>
      {children}
    </div>
  );
}

function PersonRow({ person }: { person: Person }) {
  return (
    <div className="flex items-center gap-3">
      <PersonDot person={person} />
      <span className="text-sm font-medium text-fg-2">
        {person.isCurrentUser ? "Du" : person.name}
      </span>
    </div>
  );
}

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
  const title = slot.label ? `${task.title} (${slot.label})` : task.title;
  const dayLabel = `${getDay(day.getDay())}, ${day.getDate()}.${day.getMonth() + 1}.`;

  function close() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      variant="sheet"
      title={title}
      className={SHEET_CLASS}
    >
      <p className="-mt-2 mb-3 text-sm text-muted">{dayLabel}</p>

      <Section label="Geplant von">
        {slot.assignee ? (
          <PersonRow person={slot.assignee} />
        ) : (
          <p className="text-sm italic text-subtle">
            Noch niemand eingeteilt.
          </p>
        )}
      </Section>

      {slot.completedBy && (
        <Section label="Erledigt von">
          <PersonRow person={slot.completedBy} />
        </Section>
      )}

      {slot.notes && (
        <Section label="Notiz">
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 dark:border-amber-500/20 dark:bg-amber-500/10 py-3 text-sm leading-relaxed text-fg-2">
            {slot.notes}
          </div>
        </Section>
      )}

      <div
        className={
          actions.length === 2 ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"
        }
      >
        {actions.map((action) => (
          <Button
            key={action.key}
            variant={action.variant}
            className="w-full px-3 text-sm whitespace-nowrap"
            disabled={isPending}
            onClick={() => run(action.key, target, close)}
          >
            {action.label}
          </Button>
        ))}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
