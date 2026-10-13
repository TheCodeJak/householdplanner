"use client";

import { Glyph, type GlyphName } from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import type { FamilyMember } from "@/types/profile";
import { Modal } from "jaklib/core";

function Action({
  icon,
  label,
  danger = false,
}: {
  icon: GlyphName;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium hover:bg-surface-2 ${
        danger ? "text-error-600" : "text-fg"
      }`}
    >
      <Glyph name={icon} size={18} className={danger ? "" : "text-muted"} />
      {label}
    </button>
  );
}

/**
 * Sheet zu einem Mitglied. Bei mir selbst: Name ändern, Familie verlassen.
 * Bei anderen: Admin-Rechte geben/entziehen, aus der Familie entfernen.
 * Die Aktionen haben noch keine Funktion.
 */
export function MemberModal({
  open,
  onClose,
  member,
}: {
  open: boolean;
  onClose: () => void;
  member: FamilyMember;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="sheet"
      className="task-sheet"
      aria-label={member.name}
    >
      <div
        className="flex items-center gap-3 px-4 pt-7 pb-3"
        // Verlauf in der Personenfarbe (Laufzeitwert → inline), 26 = ~15 %
        style={{
          backgroundImage: `linear-gradient(to bottom, ${member.color}26, transparent)`,
        }}
      >
        <PersonAvatar person={member} size={48} />
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-fg">
            {member.name}
            {member.isCurrentUser && (
              <span className="font-normal text-muted"> (du)</span>
            )}
          </p>
          <p className="truncate text-xs text-muted">
            {member.isAdmin ? "Admin · " : ""}
            {member.email}
          </p>
        </div>
        <IconButton
          icon="close"
          label="Schließen"
          onClick={onClose}
          variant="plain"
        />
      </div>
      <div className="px-2 pb-3">
        {member.isCurrentUser ? (
          <>
            <Action icon="pencil" label="Name ändern" />
            <Action icon="users" label="Familie verlassen" danger />
          </>
        ) : (
          <>
            <Action
              icon="crown"
              label={
                member.isAdmin ? "Admin-Rechte entziehen" : "Zum Admin machen"
              }
            />
            <Action icon="close" label="Aus Familie entfernen" danger />
          </>
        )}
        <p className="px-3 pt-1 text-[11px] leading-snug text-subtle">
          {member.isCurrentUser
            ? "Als letzter Admin musst du vorher jemand anderen zum Admin machen."
            : `Offene Übernahmen von ${member.name} werden freigegeben, Erledigtes bleibt erhalten.`}
        </p>
      </div>
    </Modal>
  );
}
