import { Glyph } from "@/components/icons";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import type { FamilyMember } from "@/types/profile";

/**
 * Kopf der Profilseite: großer Avatar mit Schein in der Personenfarbe, Name,
 * E-Mail, Familie und darunter eine flache Leiste mit Kennzahlen.
 */
export function ProfileHero({
  person,
  familyName,
  stats,
}: {
  person: FamilyMember;
  familyName: string;
  stats: { value: number; label: string }[];
}) {
  return (
    <>
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          {/* weicher Schein in der Personenfarbe hinter dem Avatar */}
          <span
            className="absolute inset-0 scale-150 rounded-full opacity-30 blur-2xl"
            style={{ backgroundColor: person.color }}
          />
          <PersonAvatar
            person={person}
            size={88}
            className="relative ring-4 ring-surface"
          />
          <button
            type="button"
            aria-label="Profil bearbeiten"
            className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted shadow-md"
          >
            <Glyph name="pencil" size={14} />
          </button>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight text-fg">
          {person.name}
        </p>
        <p className="text-xs text-muted">{person.email}</p>
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full glass-pill px-3 py-1 text-xs font-semibold text-fg-2">
          <Glyph name="users" size={13} /> {familyName}
        </span>
      </div>

      <div className="mt-4 flex divide-x divide-line rounded-2xl glass-pill py-1.5">
        {stats.map((s) => (
          <div key={s.label} className="flex-1 text-center">
            <p className="text-base leading-tight font-bold text-fg">
              {s.value}
            </p>
            <p className="text-[10px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </>
  );
}
