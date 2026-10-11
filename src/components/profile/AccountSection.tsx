import { Glyph, type GlyphName } from "@/components/icons";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { FamilyMember } from "@/types/profile";
import { Card } from "jaklib/core";

function AccountRow({
  icon,
  label,
  value,
  danger = false,
}: {
  icon: GlyphName;
  label: string;
  value?: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm ${
        danger ? "text-error-600" : "text-fg"
      }`}
    >
      <Glyph name={icon} size={18} className={danger ? "" : "text-muted"} />
      <span className="flex-1 font-medium">{label}</span>
      {value && (
        <span className="max-w-[45%] truncate text-xs text-muted">{value}</span>
      )}
      {!danger && <Glyph name="chevron" size={14} className="text-subtle" />}
    </button>
  );
}

/**
 * Konto: Name, E-Mail, Passwort – darunter abgesetzt Abmelden und Familie
 * verlassen. Die Zeilen haben noch keine Aktionen.
 */
export function AccountSection({ person }: { person: FamilyMember }) {
  const group = "min-h-0 divide-y divide-line overflow-hidden glass-card";

  return (
    <>
      <SectionLabel>Konto</SectionLabel>
      <Card variant="panel" className={group}>
        <AccountRow icon="pencil" label="Name" value={person.name} />
        <AccountRow icon="mail" label="E-Mail" value={person.email} />
        <AccountRow icon="lock" label="Passwort ändern" />
      </Card>

      <Card variant="panel" className={`mt-3 ${group}`}>
        <AccountRow icon="logout" label="Abmelden" danger />
        <AccountRow icon="users" label="Familie verlassen" danger />
      </Card>
      <p className="mt-1.5 px-4 text-[11px] leading-snug text-subtle">
        Beim Verlassen werden deine offenen Übernahmen freigegeben. Erledigtes
        bleibt in der Statistik.
      </p>
    </>
  );
}
