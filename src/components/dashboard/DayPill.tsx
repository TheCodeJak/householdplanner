import { getShortDay } from "@/lib/dateUtils";

/** Eine Tages-Kachel im Wochenstreifen ("So / 11") */
export function DayPill({
  day,
  selected,
  isToday,
  focusable,
  onSelect,
}: {
  day: Date;
  selected: boolean;
  isToday: boolean;
  /** false für die angeschnittenen Nachbarwochen: per Tab nicht erreichbar */
  focusable: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      tabIndex={focusable ? 0 : -1}
      // Screenreader sagen beim gewählten Tag "aktuelles Datum" an
      aria-current={selected ? "date" : undefined}
      className={`flex flex-col items-center gap-0.5 rounded-2xl py-2.5 transition-colors ${
        selected
          ? // shadow-brand-600/30: Schatten in Markenfarbe mit 30 % Deckkraft
            "bg-primary text-on-primary shadow-md shadow-primary/30"
          : // glass-pill: eigene Klasse aus globals.css (hell deckend, dunkel Milchglas)
            "glass-pill text-fg-2"
      }`}
    >
      <span
        className={`text-caption font-medium ${selected ? "text-on-primary" : "text-subtle"}`}
      >
        {getShortDay(day.getDay())}
      </span>
      <span
        className={`text-body font-bold ${
          !selected && isToday ? "text-accent" : ""
        }`}
      >
        {day.getDate()}
      </span>
    </button>
  );
}
