import { IconButton } from "@/components/ui/IconButton";
import { getMonth } from "@/lib/dateUtils";

/**
 * "‹ Oktober 2026 ›" plus "Zu heute" (nur wenn nicht heute gewählt ist).
 * Die Pfeile blättern wochenweise; sie sind der sichtbare Einstieg, die
 * eigentliche Bedienung mit einer Hand ist das Wischen über den Streifen.
 */
export function MonthNav({
  date,
  isToday,
  onPrev,
  onNext,
  onToday,
}: {
  date: Date;
  isToday: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  return (
    <div className="mb-2 flex items-center gap-1.5 px-4">
      <IconButton icon="left" label="Vorherige Woche" onClick={onPrev} />
      {/* min-w-28: feste Mindestbreite, damit der rechte Pfeil beim
          Monatswechsel (Mai ↔ September) nicht hin- und herspringt */}
      <h1 className="min-w-28 text-center text-sm font-semibold text-fg-2">
        {getMonth(date.getMonth())}{" "}
        <span className="font-normal text-subtle">{date.getFullYear()}</span>
      </h1>
      <IconButton icon="right" label="Nächste Woche" onClick={onNext} />

      {/* flex-1 schiebt "Zu heute" an den rechten Rand */}
      <span className="flex-1" />
      {!isToday && (
        <button
          type="button"
          onClick={onToday}
          className="rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Zu heute
        </button>
      )}
    </div>
  );
}
