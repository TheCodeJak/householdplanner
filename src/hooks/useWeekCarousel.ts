import { useLayoutEffect, useRef } from "react";

// So lange muss das Scrollen ruhen, bevor wir auswerten, wo es eingerastet ist
const SETTLE_MS = 120;

/**
 * Logik des Wochen-Karussells (WeekCarousel): drei Wochen nebeneinander
 * (vorige, aktuelle, nächste) in einem horizontal scrollbaren Container mit
 * CSS-Scroll-Snap.
 *
 * Ablauf:
 * 1. Normalerweise steht die mittlere Woche im Bild.
 * 2. Wischt man, scrollt der Browser selbst und rastet (snap) auf einer Woche ein.
 * 3. Ruht das Scrollen, prüfen wir die Position: links eingerastet → eine Woche
 *    zurück, rechts → eine vor (`onShift(±7)`).
 * 4. Dadurch ändert sich `weekKey`, die drei Wochen werden neu berechnet, und
 *    wir springen ohne Animation zurück in die Mitte – sichtbar bleibt dieselbe Woche.
 *
 * Die Pfeil-Buttons nutzen denselben Weg: `scrollWeek` scrollt weich eine Seite
 * weiter, den Rest erledigt Schritt 3.
 *
 * @param weekKey   eindeutiger Schlüssel der angezeigten Woche (z.B. Montag als ISO)
 * @param onShift   verschiebt den gewählten Tag um n Tage
 */
export function useWeekCarousel(
  weekKey: string,
  onShift: (delta: number) => void,
) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Solange ein Finger auf dem Streifen liegt, nicht auswerten
  const touching = useRef(false);

  // Abstand zwischen zwei Wochenseiten in Pixeln (Seitenbreite + Lücke)
  function pageStep() {
    const el = scrollerRef.current;
    if (!el || el.children.length < 2) return 0;
    const first = el.children[0] as HTMLElement;
    const second = el.children[1] as HTMLElement;
    return second.offsetLeft - first.offsetLeft;
  }

  // useLayoutEffect statt useEffect: läuft VOR dem Zeichnen, so ist der Sprung
  // zurück in die Mitte nie als Ruckler zu sehen
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollLeft = pageStep();
  }, [weekKey]);

  // Wird bei jedem Scroll-Event aufgerufen; erst nach SETTLE_MS Ruhe auswerten
  function settle() {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const el = scrollerRef.current;
      const step = pageStep();
      if (!el || !step || touching.current) return;
      const page = Math.round(el.scrollLeft / step); // 0, 1 oder 2
      if (page === 0) onShift(-7);
      if (page === 2) onShift(7);
    }, SETTLE_MS);
  }

  /** Weich eine Woche vor (1) oder zurück (-1) scrollen */
  function scrollWeek(dir: 1 | -1) {
    const el = scrollerRef.current;
    const step = pageStep();
    if (!el || !step) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollTo({
      left: step * (1 + dir),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  // Alles, was der Scroll-Container als Props braucht
  const scrollerProps = {
    ref: scrollerRef,
    onScroll: settle,
    onTouchStart: () => {
      touching.current = true;
    },
    onTouchEnd: () => {
      touching.current = false;
      settle();
    },
  };

  return { scrollerProps, scrollWeek };
}
