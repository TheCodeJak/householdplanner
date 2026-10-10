import { TaskIcon } from "@/app/components/icons";
import { TASK_ICON_TONES, TaskIconName, taskIconTones } from "@/lib/taskIcons";
import { CSSProperties, ReactNode } from "react";

// Platzhalter für Seiten, die noch gebaut werden: schwebende Pastell-Kacheln
// (oder eine eigene Illustration), Titel, kurzer Ausblick und ein „In Arbeit“-Badge.
// Reine CSS-Animationen; bei „Bewegung reduzieren“ stehen sie still.
export function ComingSoon({
  title,
  description,
  icons,
  illustration,
}: {
  title: string;
  description: string;
  /** Genau drei Icons: groß in der Mitte, zwei kleine daneben */
  icons?: [TaskIconName, TaskIconName, TaskIconName];
  /** Statt der Kacheln eine eigene Illustration */
  illustration?: ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col items-center justify-center px-8 py-12 text-center">
      <div className="mb-10 flex h-36 items-center justify-center">
        {illustration ?? (icons && <FloatingTiles icons={icons} />)}
      </div>

      <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-glass bg-surface/60 px-3 py-1 text-xs font-semibold text-muted shadow-sm backdrop-blur">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
        </span>
        In Arbeit
      </span>

      <h1 className="text-2xl font-bold tracking-tight text-fg">{title}</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}

function Tile({
  name,
  size,
  tilt,
  delay,
}: {
  name: TaskIconName;
  size: "sm" | "lg";
  tilt: number;
  delay: number;
}) {
  return (
    <span
      className={`flex items-center justify-center border border-glass shadow-lg shadow-brand-900/10 motion-safe:animate-float ${
        size === "lg" ? "h-24 w-24 rounded-[28px]" : "h-16 w-16 rounded-2xl"
      } ${TASK_ICON_TONES[taskIconTones[name]]}`}
      style={
        {
          "--tilt": `${tilt}deg`,
          transform: `rotate(${tilt}deg)`,
          animationDelay: `${delay}s`,
        } as CSSProperties
      }
    >
      <TaskIcon name={name} size={size === "lg" ? "xl" : "lg"} />
    </span>
  );
}

function FloatingTiles({
  icons: [main, left, right],
}: {
  icons: [TaskIconName, TaskIconName, TaskIconName];
}) {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <div className="mt-12">
        <Tile name={left} size="sm" tilt={-10} delay={0.6} />
      </div>
      <Tile name={main} size="lg" tilt={3} delay={0} />
      <div className="-mt-12">
        <Tile name={right} size="sm" tilt={9} delay={1.2} />
      </div>
    </div>
  );
}

// Animiertes Mini-Balkendiagramm für die Statistik-Seite
export function BarsIllustration() {
  const bars = [
    { tone: "bg-sky-300 dark:bg-sky-400/70", delay: 0 },
    { tone: "bg-amber-300 dark:bg-amber-400/70", delay: 0.3 },
    { tone: "bg-brand-400 dark:bg-brand-500/80", delay: 0.6 },
    { tone: "bg-pink-300 dark:bg-pink-400/70", delay: 0.9 },
    { tone: "bg-emerald-300 dark:bg-emerald-400/70", delay: 1.2 },
  ];

  return (
    <div
      className="flex h-32 w-52 items-end justify-center gap-3 rounded-3xl border border-glass bg-surface/60 px-6 pt-6 pb-5 shadow-lg shadow-brand-900/10 backdrop-blur"
      aria-hidden
    >
      {bars.map(({ tone, delay }, i) => (
        <span
          key={i}
          className={`h-full w-6 origin-bottom rounded-t-lg rounded-b-sm motion-safe:animate-bar ${tone}`}
          style={{ animationDelay: `${delay}s`, transform: "scaleY(0.6)" }}
        />
      ))}
    </div>
  );
}
