import { Glyph } from "@/components/icons";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import type { FamilyMember } from "@/types/profile";

/**
 * Mitglieder als kleine Kreise mit Namen darunter, Admins mit Krönchen.
 * Hinten ein neutraler "+"-Kreis, der das Einladungs-Modal öffnet.
 */
export function MemberCircles({
  members,
  onSelect,
  onInvite,
}: {
  members: FamilyMember[];
  onSelect: (member: FamilyMember) => void;
  onInvite: () => void;
}) {
  return (
    // -mx-4 px-5: darf bis an den Rand wischen, startet aber bündig.
    // pt-1.5: overflow-x-auto schneidet auch oben ab – Platz fürs Krönchen
    <div className="-mx-4 flex [scrollbar-width:none] gap-3 overflow-x-auto px-5 pt-1.5 pb-1">
      {members.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onSelect(m)}
          className="flex w-13 shrink-0 flex-col items-center gap-1"
        >
          <span className="relative">
            <PersonAvatar
              person={m}
              size={44}
              className="ring-2 ring-surface"
            />
            {m.isAdmin && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-amber-900 ring-2 ring-surface">
                <Glyph name="crown" size={9} />
              </span>
            )}
          </span>
          <span className="w-full truncate text-center text-caption font-medium text-fg-2">
            {m.isCurrentUser ? "Du" : m.name}
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={onInvite}
        className="flex w-13 shrink-0 flex-col items-center gap-1"
      >
        {/* Weiße Fläche mit feiner Linie: gleiche Größe wie die Avatare, aber
            ruhig – nichts, was um Aufmerksamkeit mit den Personen konkurriert */}
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-fg-2 ring-1 ring-line">
          <Glyph name="plus" size={18} />
        </span>
        <span className="text-caption font-medium text-fg-2">Einladen</span>
      </button>
    </div>
  );
}
