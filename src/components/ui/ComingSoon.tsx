import type { ReactNode } from "react";

/**
 * Platzhalter für Seiten, die noch gebaut werden: Illustration, „In Arbeit“-Badge,
 * Titel und ein kurzer Ausblick.
 * Als `illustration` z.B. <FloatingTiles icons={…} /> oder <BarsIllustration />.
 */
export function ComingSoon({
  title,
  description,
  illustration,
}: {
  title: string;
  description: string;
  illustration: ReactNode;
}) {
  return (
    // 100dvh = echte sichtbare Bildschirmhöhe (passt sich der mobilen
    // Adressleiste an), abzüglich Platz für die Bottom-Navigation
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col items-center justify-center px-8 py-12 text-center">
      <div className="mb-10 flex h-36 items-center justify-center">
        {illustration}
      </div>

      <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-glass bg-surface/60 px-3 py-1 text-xs font-semibold text-muted shadow-sm backdrop-blur">
        {/* Pulsierender Punkt: animate-ping vergrößert und blendet den äußeren
            Kreis immer wieder aus, der innere bleibt stehen */}
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
