import { SlotView, TaskView } from "@/types/plan";
import { Card } from "jaklib/core";
import { PersonPair } from "../ui/PersonPair";
import { TaskTile } from "../ui/TaskTile";
import { TaskSlotRow } from "./TaskSlotRow";

function statusText({ status, assignee, completedBy }: SlotView) {
  if (status === "completed") {
    if (!completedBy) return "Erledigt";
    return completedBy.isCurrentUser
      ? "Von dir erledigt"
      : `Erledigt von ${completedBy.name}`;
  }
  if (status === "claimed" && assignee) {
    return assignee.isCurrentUser ? "Du bist dran" : `${assignee.name} ist dran`;
  }
  return "Noch frei";
}

export function TaskCard({
  taskView: { title, icon, slots },
  onSelect,
}: {
  taskView: TaskView;
  onSelect: (slotId: string | null) => void;
}) {
  const isCompact = slots.length === 1 && !slots[0].label;
  const isDone = slots.every((slot) => slot.status === "completed");
  const titleClass = isDone ? "text-subtle line-through" : "text-fg";

  if (isCompact) {
    const slot = slots[0];
    return (
      <Card variant="panel" className="glass-card min-h-0 overflow-hidden">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <TaskTile icon={icon} title={title} completed={isDone} />
          <span className="min-w-0 flex-1">
            <span
              className={`line-clamp-2 text-xs font-semibold ${titleClass}`}
            >
              {title}
            </span>
            <span
              className={`mt-0.5 block truncate text-[11px] ${
                slot.status === "claimed" ? "text-muted" : "text-subtle"
              }`}
            >
              {statusText(slot)}
            </span>
          </span>
          <PersonPair assignee={slot.assignee} completedBy={slot.completedBy} />
        </button>
      </Card>
    );
  }

  return (
    <Card variant="panel" className="glass-card min-h-0 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <TaskTile icon={icon} title={title} completed={isDone} />
        <span className={`min-w-0 flex-1 text-xs font-semibold ${titleClass}`}>
          {title}
        </span>
      </div>
      <Card variant="panel" className="glass-inset min-h-0 mx-2 mb-2 p-2 rounded-xl">
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
