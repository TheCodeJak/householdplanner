import { IconButton } from "@/components/ui/IconButton";
import { getMonth } from "@/lib/dateUtils";

/**
 * "Oktober 2026" links, rechts "Heute" und zwei kleine Pfeile. Die Pfeile
 * blättern wochenweise; sie sind der sichtbare Einstieg, die eigentliche
 * Bedienung mit einer Hand ist das Wischen über den Streifen.
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
    // h-8: feste Höhe, damit die Zeile nie wächst oder schrumpft
    <div className="mb-2.5 flex h-8 items-center gap-2 px-5">
      {/* truncate + whitespace-nowrap: auch "September 2026" bricht nie um */}
      <h1 className="min-w-0 truncate text-title font-bold tracking-tight whitespace-nowrap text-fg">
        {getMonth(date.getMonth())}{" "}
        <span className="font-medium text-subtle">{date.getFullYear()}</span>
      </h1>

      {/* flex-1 schiebt "Heute" und die Pfeile an den rechten Rand */}
      <span className="flex-1" />

      {/* "Heute" nimmt seinen Platz immer ein und blendet nur ein und aus.
          Sonst würde das Erscheinen die Pfeile oder den Monat verschieben.
          inert: unsichtbar, also weder anklick- noch per Tab erreichbar. */}
      <button
        type="button"
        onClick={onToday}
        inert={isToday}
        aria-hidden={isToday}
        className={`rounded-full bg-primary/10 px-2.5 py-1 text-caption font-semibold text-primary-hover transition-opacity duration-200 motion-reduce:transition-none dark:bg-brand-400/15 dark:text-brand-300 ${
          isToday ? "opacity-0" : "opacity-100"
        }`}
      >
        Heute
      </button>

      <span className="flex items-center">
        <IconButton
          icon="left"
          label="Vorherige Woche"
          onClick={onPrev}
          variant="plain"
          size="sm"
        />
        <IconButton
          icon="right"
          label="Nächste Woche"
          onClick={onNext}
          variant="plain"
          size="sm"
        />
      </span>
    </div>
  );
}
