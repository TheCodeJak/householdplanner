"use client";

import { useAssignmentActions } from "@/hooks/useAssignmentActions";
import { useDayPlan } from "@/hooks/useDayPlan";
import { fromIsoDate, getDay } from "@/lib/dateUtils";
import { getSlotActions } from "@/lib/getSlotActions";
import { Person, SlotRef } from "@/types/plan";
import { Button, Modal } from "jaklib/core";
import { PersonDot } from "../ui/PersonDot";

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
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
      <span className="text-sm font-medium text-slate-700">
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

  const title = slot.label ? `${task.title} (${slot.label})` : task.title;
  const dayLabel = `${getDay(day.getDay())}, ${day.getDate()}.${day.getMonth() + 1}.`;

  function close() {
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={close} variant="sheet" title={title}>
      <p className="-mt-3 mb-5 text-sm text-slate-500">{dayLabel}</p>

      <Section label="Geplant von">
        {slot.assignee ? (
          <PersonRow person={slot.assignee} />
        ) : (
          <p className="text-sm italic text-slate-400">
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
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
            {slot.notes}
          </div>
        </Section>
      )}

      <div className="flex flex-col gap-2">
        {getSlotActions(slot).map((action) => (
          <Button
            key={action.key}
            variant={action.variant}
            className="w-full"
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
