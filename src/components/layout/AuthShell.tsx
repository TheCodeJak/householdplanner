import { GlowBackground } from "@/components/ui/GlowBackground";
import { IconMosaic } from "@/components/ui/IconMosaic";
import type { TaskIconName } from "@/lib/taskIcons";
import type { CSSProperties, ReactNode } from "react";

/*
 * jaklib-Komponenten (TextField, Button) lesen ihr Aussehen aus CSS-Variablen.
 * Setzt man diese an einem Eltern-Element neu, gelten sie für alle Felder darin
 * – ohne jaklib selbst anzufassen. Hier: deckende Felder mit feinem Rand, damit
 * sie sich klar von der halbtransparenten Karte abheben, und Buttons ohne den
 * orangefarbenen Schatten.
 */
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

/**
 * Gemeinsamer Rahmen für Login, Registrierung und Onboarding: Farbflächen im
 * Hintergrund, Icon-Mosaik (oder eine eigene `illustration`), Überschrift und
 * der Inhalt (`children`) in einer Milchglas-Karte.
 *
 * `transitionKey`: Ändert er sich (z.B. beim nächsten Schritt im Onboarding),
 * blendet der Inhalt weich neu ein; der Hintergrund bleibt stehen.
 */
export function AuthShell({
  title,
  subtitle,
  icons,
  illustration,
  transitionKey,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  icons?: (TaskIconName | null)[];
  illustration?: ReactNode;
  transitionKey?: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    // min-h-dvh: mindestens die echte sichtbare Bildschirmhöhe.
    // pt-[max(2rem,env(safe-area-inset-top))]: mindestens 2rem Abstand, auf
    // Handys mit Notch aber mindestens so viel, wie die Notch braucht.
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-orange-50 px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] dark:bg-page">
      <GlowBackground />

      {/* my-auto zentriert vertikal, schneidet aber – anders als
          justify-center – nichts ab, wenn der Inhalt höher als der Screen ist */}
      <div
        key={transitionKey}
        className={`relative mx-auto my-auto w-full max-w-sm py-6 ${
          transitionKey ? "motion-safe:animate-step-in" : ""
        }`}
      >
        {illustration ?? (icons && <IconMosaic icons={icons} />)}

        <h1 className="mt-8 text-[2rem] leading-[1.1] font-bold tracking-tight text-fg">
          {title}
        </h1>
        <p className="mt-2 mb-6 text-fg-2">{subtitle}</p>

        {/* Milchglas: halbtransparente Fläche + backdrop-blur-xl zeichnet
            alles dahinter weich */}
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
