import type { Person } from "@/types/plan";

/**
 * Runder Avatar mit Anfangsbuchstabe in der Farbe der Person, in beliebiger
 * Größe.
 */
export function PersonAvatar({
  person,
  size = 40,
  className = "",
}: {
  person: Person;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${className}`}
      // Farbe und Größe sind Laufzeitwerte → inline statt Tailwind-Klasse
      style={{
        backgroundColor: person.color,
        width: size,
        height: size,
        fontSize: size * 0.4,
      }}
    >
      {person.name[0].toUpperCase()}
    </span>
  );
}
