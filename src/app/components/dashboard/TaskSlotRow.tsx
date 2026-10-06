import type { SlotView } from "@/types/plan";
import { PersonPair } from "../ui/PersonPair";
import { StatusIcon } from "../ui/TaskStatusIcon";

export function TaskSlotRow({
  slot,
  onSelect,
}: {
  slot: SlotView;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left"
    >
      <StatusIcon status={slot.status} />
      <span className="line-clamp-2 min-w-0 flex-1 text-xs font-semibold text-slate-800">
        {slot.label}
      </span>
      <PersonPair assignee={slot.assignee} completedBy={slot.completedBy} />
    </button>
  );
}
