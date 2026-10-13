/**
 * Hintergrund der Hauptapp (im Dashboard-Layout eingebunden):
 * - `.app-backdrop-fixed`: sehr helle Pastellflächen über die ganze Seite.
 *   `fixed` → bleibt beim Scrollen stehen.
 * - `.app-backdrop-top`: wärmerer Schimmer oben. `absolute` → scrollt mit weg.
 * Die Verläufe selbst stehen in globals.css, bewusst ohne blur(): Weichzeichner
 * unter dem klebenden Milchglas-Kopf müssten bei jedem Scroll-Schritt neu
 * berechnet werden und lassen ihn ruckeln.
 *
 * `-z-20` / `-z-10` legen die Ebenen hinter den Inhalt. Damit sie nicht hinter
 * dem <body> verschwinden, braucht der Eltern-Container `relative isolate`
 * (`isolate` startet eine eigene Stapel-Ebene).
 */
export function AppBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="app-backdrop-fixed pointer-events-none fixed inset-0 -z-20"
      />
      <div
        aria-hidden
        className="app-backdrop-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]"
      />
    </>
  );
}
