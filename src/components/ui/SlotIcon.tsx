import type { SlotView } from "@/types/plan";

/**
 * Die Farben der Zeitfenster als CSS-Variablen. Sie hängen an einem Behälter
 * (die Kategorie-Gruppe im Dashboard, der Dialog einer Aufgabe), der außerdem
 * die Töne der Kategorie als --tone-* setzt (toneVars in CategoryGroup):
 * - --slot-done:    erledigt, kräftiger
 * - --slot-claimed: übernommen, blasser
 * - --slot-line:    Linien und Rahmen
 * - --slot-box:     Fläche des Kastens um die Zeitfenster
 * Hell wird die Kategoriefarbe mit der Kartenfläche gemischt, dunkel mit dem
 * gedämpften Textgrau; so wirken sie in beiden Modi sauber statt trüb. Der
 * Kasten ist hell ein leicht dunklerer Weißton mit dezentem Rahmen, dunkel eine
 * Spur heller als die Karte.
 */
export const SLOT_COLOR_VARS =
  "[--slot-box:color-mix(in_oklab,black_2.5%,var(--app-surface))] [--slot-claimed:color-mix(in_oklab,var(--tone-600)_78%,var(--app-surface))] [--slot-done:color-mix(in_oklab,var(--tone-600)_92%,var(--app-surface))] [--slot-line:var(--app-line)] dark:[--slot-box:color-mix(in_oklab,white_5%,transparent)] dark:[--slot-claimed:color-mix(in_oklab,var(--tone-600)_50%,var(--app-muted))] dark:[--slot-done:color-mix(in_oklab,var(--tone-600)_85%,var(--app-muted))]";

/**
 * Icon eines Zeitfensters. Alle drei Zustände sind ein Kreis gleicher Größe
 * (24 px, Außendurchmesser 20), nur die Füllung unterscheidet sich:
 * - erledigt: gefüllter Kreis mit Haken, kräftiger
 * - übernommen: Uhr, dünner Strich und blasser
 * - offen: leerer Kreis, grau
 * Die Farben kommen aus SLOT_COLOR_VARS, also von der Kategorie.
 */
export function SlotIcon({ status }: { status: SlotView["status"] }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "shrink-0",
    "aria-hidden": true,
  };

  if (status === "completed") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" style={{ fill: "var(--slot-done)" }} />
        <path
          d="M7.5 12.5l3 3 6-6.5"
          style={{ stroke: "var(--app-surface)" }}
        />
      </svg>
    );
  }
  if (status === "claimed") {
    return (
      <svg
        {...common}
        strokeWidth={1.75}
        style={{ stroke: "var(--slot-claimed)" }}
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }
  return (
    <svg {...common} className="shrink-0 stroke-slate-300 dark:stroke-white/25">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
