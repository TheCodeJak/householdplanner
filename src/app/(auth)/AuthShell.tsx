import { TaskIcon } from "@/app/components/icons";
import { GlowBackground } from "@/app/components/ui/GlowBackground";
import { TASK_ICON_TONES, TaskIconName, taskIconTones } from "@/lib/taskIcons";
import { CSSProperties, ReactNode } from "react";

// jaklib-Komponenten lesen ihre Optik aus CSS-Variablen. Hier für die
// Milchglas-Karte überschrieben: deckende Felder mit feinem Rand,
// damit sie sich klar von der halbtransparenten Karte abheben.
const glassFieldTokens = {
  "--input-bg": "var(--app-surface)",
  "--input-border": "var(--app-line)",
  "--input-label": "var(--app-fg-2)",
  "--radius-md": "14px",
  "--h-md": "50px",
  "--h-lg": "52px",
  "--primary-shadow": "transparent",
  "--primary-shadow-hover": "transparent",
} as CSSProperties;

const TILTS = ["-rotate-6", "rotate-3", "rotate-6"];

// Pastell-Kacheln wie in den TaskCards; null = leere Milchglas-Kachel
function IconMosaic({ icons }: { icons: (TaskIconName | null)[] }) {
  return (
    <div className="grid grid-cols-4 gap-3 px-1" aria-hidden>
      {icons.map((name, i) => {
        const tilt = TILTS[i % TILTS.length];
        return name ? (
          <span
            key={i}
            className={`flex aspect-square items-center justify-center rounded-2xl border border-glass shadow-lg shadow-brand-900/5 ${
              TASK_ICON_TONES[taskIconTones[name]]
            } ${tilt}`}
          >
            <TaskIcon name={name} size="lg" />
          </span>
        ) : (
          <span
            key={i}
            className={`aspect-square rounded-2xl border border-glass bg-surface/55 shadow-md shadow-brand-900/10 backdrop-blur ${tilt}`}
          />
        );
      })}
    </div>
  );
}

// Gemeinsamer Rahmen für Login und Registrierung: Farbflächen im Hintergrund,
// Icon-Mosaik, Überschrift und das Formular in einer Milchglas-Karte.
// Der Inhalt ist vertikal zentriert; wird er höher als der Screen, scrollt die
// Seite ganz normal (my-auto statt justify-center schneidet nichts ab).
export function AuthShell({
  title,
  subtitle,
  icons,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  icons: (TaskIconName | null)[];
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-orange-50 px-5 dark:bg-page pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <GlowBackground />

      <div className="relative mx-auto my-auto w-full max-w-sm py-6">
        <IconMosaic icons={icons} />

        <h1 className="mt-8 text-[2rem] leading-[1.1] font-bold tracking-tight text-fg">
          {title}
        </h1>
        <p className="mt-2 mb-6 text-fg-2">{subtitle}</p>

        <div
          className="rounded-3xl border border-glass bg-surface/45 p-5 shadow-xl shadow-brand-900/5 backdrop-blur-xl"
          style={glassFieldTokens}
        >
          {children}
        </div>
      </div>

      <p className="relative text-center text-sm text-fg-2">{footer}</p>
    </main>
  );
}
