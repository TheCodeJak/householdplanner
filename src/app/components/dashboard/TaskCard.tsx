import { Person, TaskView } from "@/types/plan";
import { Card } from "jaklib/core";
import { PersonPair } from "../ui/PersonPair";
import { StatusIcon } from "../ui/TaskStatusIcon";
import { TaskSlotRow } from "./TaskSlotRow";

export type TaskStatus = "open" | "claimed" | "completed";

export type Slot = {
  status: TaskStatus;
  assignee?: Person;
  completedBy?: Person;
  slotTitle?: string;
};

export const ICON_SIZE = 28;

export function FilledCheck({ className }: { className: string }) {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 28 28"
      fill="none"
      className={className}
    >
      <circle cx="14" cy="14" r="14" fill="currentColor" />
      <path
        d="M9 14.2l3.2 3.2 6.8-6.8"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TaskCard({
  taskView: { title, slots },
  onSelect,
}: {
  taskView: TaskView;
  onSelect: (slotId: string | null) => void;
}) {
  const isCompact = slots.length === 1 && !slots[0].label;

  if (isCompact) {
    const { status, assignee, completedBy } = slots[0];
    return (
      <Card variant="panel" className="min-h-0 overflow-hidden">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <StatusIcon status={status} />
          <span className="line-clamp-2 min-w-0 flex-1 text-xs font-semibold text-slate-800">
            {title}
          </span>
          <PersonPair assignee={assignee} completedBy={completedBy} />
        </button>
      </Card>
    );
  }

  return (
    <Card variant="panel" className="min-h-0 overflow-hidden">
      <div className="px-4 py-3 text-xs font-semibold text-slate-800">
        {title}
      </div>
      <Card variant="panel" className="min-h-0 mx-2 mb-2 p-2 rounded-xl">
        <div className="flex flex-col gap-y-2">
          {slots.map((slot) => (
            <TaskSlotRow
              key={slot.slotId}
              slot={slot}
              onSelect={() => onSelect(slot.slotId)}
            />
          ))}
        </div>
      </Card>
    </Card>
  );
}
