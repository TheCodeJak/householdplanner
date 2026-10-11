// Fünf farbige Balken – Illustration für die Statistik-Seite (ComingSoon)
const BAR_TONES = [
  "bg-sky-300 dark:bg-sky-400/70",
  "bg-amber-300 dark:bg-amber-400/70",
  "bg-brand-400 dark:bg-brand-500/80",
  "bg-pink-300 dark:bg-pink-400/70",
  "bg-emerald-300 dark:bg-emerald-400/70",
];

export function BarsIllustration() {
  return (
    <div
      className="flex h-32 w-52 items-end justify-center gap-3 rounded-3xl border border-glass bg-surface/60 px-6 pt-6 pb-5 shadow-lg shadow-brand-900/10 backdrop-blur"
      aria-hidden
    >
      {BAR_TONES.map((tone) => (
        <span
          key={tone}
          className={`h-full w-6 rounded-t-lg rounded-b-sm ${tone}`}
        />
      ))}
    </div>
  );
}
