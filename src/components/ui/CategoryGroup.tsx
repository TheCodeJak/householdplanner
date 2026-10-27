import { Glyph } from "@/components/icons";
import {
  TASK_TONE_HEX,
  type TaskIconName,
  type TaskIconTone,
  taskIconTones,
} from "@/lib/taskIcons";
import type { CSSProperties, ReactNode } from "react";
import { Collapse } from "./Collapse";
import { TaskTile } from "./TaskTile";

export type CategoryInfo = {
  name: string;
  /** Für Zähler und Farbe (erstes Icon) */
  items: { icon: TaskIconName | null }[];
};

/**
 * Klappbare Gruppe für eine Kategorie: Kopf mit Kachel, Name und Zähler
 * (oder eigener Angabe über `meta`, z.B. Fortschritt im Dashboard), darunter
 * beliebiger Inhalt (children), bündig bis an den Rand.
 *
 * Bewusst generisch – kennt keine Aufgaben-Typen, nur Name + Einträge. So
 * passt sie auch ins Dashboard (dort stecken dann die TaskRows darin).
 *
 * Farbe = Ton des ersten Eintrags mit Icon in der Kategorie, als Fläche mit
 * leichtem Verlauf nach rechts:
 * - hell:   100er-Ton → etwas heller (zur Hälfte Richtung 50er), Rand in 100
 * - dunkel: 600er-Ton mit der Kartenfarbe gemischt (32 % → 24 %). Der tiefe
 *           Ton wirkt satter als der helle 400er, ohne zu leuchten.
 * Die Liste liegt hell auf Weiß bzw. dunkel auf neutralem Grau – so setzt sie
 * sich vom farbigen Kopf ab.
 */
export function CategoryGroup({
  info,
  open,
  onToggle,
  meta,
  children,
}: {
  info: CategoryInfo;
  open: boolean;
  onToggle: () => void;
  /** Rechts im Kopf statt des Zählers */
  meta?: ReactNode;
  children: ReactNode;
}) {
  // Der erste Eintrag mit Icon gibt Farbe und Kopf-Icon vor; Aufgaben ohne Icon
  // sollen eine Gruppe nicht grau machen, nur weil sie alphabetisch vorn stehen
  const first = info.items.find((item) => item.icon) ?? info.items[0];
  const tone: TaskIconTone = first?.icon ? taskIconTones[first.icon] : "slate";

  return (
    <section
      style={toneVars(tone)}
      className="overflow-hidden rounded-3xl bg-linear-to-r from-(--tone-100) to-[color-mix(in_oklab,var(--tone-100)_55%,var(--tone-50))] ring-1 ring-(color:--tone-100) dark:from-[color-mix(in_oklab,var(--tone-600)_32%,var(--app-surface))] dark:to-[color-mix(in_oklab,var(--tone-600)_24%,var(--app-surface))] dark:ring-white/5"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        <TaskTile icon={first?.icon ?? null} title={info.name} size={34} />
        <span className="min-w-0 flex-1 truncate text-body font-bold text-fg">
          {info.name}
        </span>
        {meta ?? (
          // fg-2 statt muted: auf dem getönten Kopf reicht muted dunkel nicht für 4,5:1
          <span className="rounded-full bg-surface/70 px-2 py-0.5 text-caption font-bold text-fg-2 dark:bg-white/8">
            {info.items.length}
          </span>
        )}
        <Glyph
          name="chevron"
          size={14}
          className={`shrink-0 text-subtle transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>
      <Collapse open={open}>
        {/* Bündig: kein Abstand, keine Rundung – die Gruppe schneidet per
            overflow-hidden die unteren Ecken rund ab */}
        <div className="bg-surface/85 dark:bg-surface-2">{children}</div>
      </Collapse>
    </section>
  );
}

/**
 * Setzt die Töne als CSS-Variablen. Die Klassen oben lesen nur diese – so
 * reicht ein Klassen-String für alle zehn Farben (Tailwind braucht Klassen
 * vollständig ausgeschrieben, `from-${tone}-100` würde nicht funktionieren).
 */
function toneVars(tone: TaskIconTone) {
  const hex = TASK_TONE_HEX[tone];
  return {
    "--tone-50": hex[50],
    "--tone-100": hex[100],
    "--tone-600": hex[600],
  } as CSSProperties;
}
