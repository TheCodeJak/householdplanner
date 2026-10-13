import type { Person } from "@/types/plan";
import { PersonDot } from "./PersonDot";

/**
 * Wer ist dran / wer hat erledigt, rechts in einer Karte.
 * Hat jemand anderes erledigt als geplant, erscheint "J → L".
 */
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
          <span className="text-xs font-bold text-subtle">→</span>
          <PersonDot person={completedBy} />
        </>
      )}
    </div>
  );
}
