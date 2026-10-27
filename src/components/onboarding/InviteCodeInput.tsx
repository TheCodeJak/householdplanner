import { formatInviteCode, parseInviteCode } from "@/lib/inviteCode";

/**
 * Großes Feld für den Einladungscode: Großbuchstaben, Schreibschrift mit
 * gleicher Zeichenbreite, der Strich in der Mitte erscheint von selbst.
 * `value` ist immer der reine Code ("K7PM4XQR"); beim Einfügen von
 * "k7pm-4xqr" kommt trotzdem das Richtige an.
 */
export function InviteCodeInput({
  value,
  onChange,
  error,
  disabled = false,
}: {
  value: string;
  onChange: (code: string) => void;
  error?: string | null;
  disabled?: boolean;
}) {
  return (
    <div>
      <input
        value={formatInviteCode(value)}
        onChange={(e) => onChange(parseInviteCode(e.target.value))}
        disabled={disabled}
        placeholder="XXXX–XXXX"
        aria-label="Einladungscode"
        aria-invalid={error ? true : undefined}
        // Eine Tastatur mit Großbuchstaben, ohne Autokorrektur und Vorschläge
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={`h-16 w-full rounded-2xl bg-surface px-4 text-center font-mono text-2xl font-bold tracking-[0.2em] text-fg ring-1 transition outline-none placeholder:font-medium placeholder:text-subtle/70 focus:ring-2 disabled:opacity-60 ${
          error
            ? "ring-error-600 focus:ring-error-600"
            : "ring-line focus:ring-brand-500"
        }`}
      />
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-error-600">
          {error}
        </p>
      )}
    </div>
  );
}
