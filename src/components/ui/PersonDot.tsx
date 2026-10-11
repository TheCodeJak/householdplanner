import type { Person } from "@/types/plan";

/** Runder Avatar mit Anfangsbuchstabe in der Farbe der Person (aus colorFromUserId) */
export function PersonDot({ person }: { person: Person }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      // Farbe ist ein Laufzeitwert pro Person → inline statt Tailwind-Klasse.
      // Tailwind kennt nur Klassen, die beim Build vollständig im Code stehen.
      style={{ backgroundColor: person.color }}
    >
      {person.name[0].toUpperCase()}
    </span>
  );
}
