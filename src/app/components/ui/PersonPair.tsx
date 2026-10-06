import type { Person } from "@/types/plan";
import { PersonDot } from "./PersonDot";

export function PersonPair({
  assignee,
  completedBy,
}: {
  assignee: Person | null;
  completedBy: Person | null;
}) {
  if (!assignee) return null;
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <PersonDot person={assignee} />
      {completedBy && completedBy.id !== assignee.id && (
        <>
          <span className="text-xs font-bold text-slate-400">→</span>
          <PersonDot person={completedBy} />
        </>
      )}
    </div>
  );
}
