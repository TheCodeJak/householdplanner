/**
 * Schalter „Alle | Meine 4“ im Kopf des Dashboards. Aktiv ist „Meine“ sanft in
 * der Markenfarbe getönt: Die Farbe zeigt „hier ist etwas eingeschaltet“. Die
 * Zahl ist, wie viele Zeitfenster mir heute gehören.
 */
export function MineFilter({
  mineOnly,
  mineCount,
  onChange,
}: {
  mineOnly: boolean;
  mineCount: number;
  onChange: (mineOnly: boolean) => void;
}) {
  const options = [
    {
      label: "Alle",
      count: null,
      value: false,
      on: "bg-surface text-fg shadow-sm",
    },
    {
      label: "Meine",
      count: mineCount,
      value: true,
      on: "bg-primary/15 text-primary-hover dark:bg-brand-400/20 dark:text-brand-300",
    },
  ];

  return (
    <div
      role="group"
      aria-label="Aufgaben filtern"
      className="flex shrink-0 rounded-full bg-black/5 p-0.5 dark:bg-white/10"
    >
      {options.map(({ label, count, value, on }) => {
        const active = mineOnly === value;
        return (
          <button
            key={label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={`flex h-7 items-center gap-1 rounded-full px-3 text-caption font-semibold transition-colors duration-200 motion-reduce:transition-none ${
              active ? on : "text-muted"
            }`}
          >
            {label}
            {count !== null && (
              <span className="tabular-nums opacity-70">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
