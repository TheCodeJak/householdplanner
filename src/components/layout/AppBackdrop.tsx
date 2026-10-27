/**
 * Hintergrund der Hauptapp (im Dashboard-Layout eingebunden): ein leichter
 * Schimmer in Markenfarbe oben über der warmen Seitenfarbe. `absolute` →
 * scrollt mit weg. Der Verlauf selbst steht in globals.css (.app-backdrop).
 *
 * `-z-10` legt die Ebene hinter den Inhalt. Damit sie nicht hinter dem <body>
 * verschwindet, braucht der Eltern-Container `relative isolate` (`isolate`
 * startet eine eigene Stapel-Ebene).
 */
export function AppBackdrop() {
  return (
    <div
      aria-hidden
      className="app-backdrop pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]"
    />
  );
}
