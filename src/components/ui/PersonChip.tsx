import type { Person } from "@/types/plan";
import { PersonDot } from "./PersonDot";

/** Avatar + kleine Beschriftung + Name, z.B. "Geplant von / Du" im Detail-Sheet */
export function PersonChip({
  label,
  person,
}: {
  label: string;
  person: Person;
}) {
  return (
    // min-w-0: Flex-Kinder sind sonst mindestens so breit wie ihr Inhalt –
    // erst damit kann `truncate` unten einen langen Namen mit "…" kürzen
    <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-surface-2 py-1.5 pr-3 pl-1.5">
      <PersonDot person={person} />
      <div className="min-w-0 leading-tight">
        <p className="text-caption font-medium text-subtle">{label}</p>
        <p className="truncate text-secondary font-semibold text-fg">
          {person.isCurrentUser ? "Du" : person.name}
        </p>
      </div>
    </div>
  );
}
