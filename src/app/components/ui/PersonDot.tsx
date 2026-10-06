import { Person } from "@/types/plan";

export function PersonDot({ person }: { person: Person }) {
  return (
    <span
      className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ backgroundColor: person.color }}
    >
      {person.name[0].toUpperCase()}
    </span>
  );
}
