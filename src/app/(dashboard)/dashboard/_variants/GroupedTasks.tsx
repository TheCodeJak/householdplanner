"use client";

// ⚠️ TEMPORÄR: Aufgaben des Tages nach Kategorie gruppiert, in mehreren
// Designs (Achsen g, k, z – siehe variantConfig.ts).

import { TaskCard } from "@/components/dashboard/TaskCard";
import { Glyph } from "@/components/icons";
import { CategoryGroup } from "@/components/ui/CategoryGroup";
import { Collapse } from "@/components/ui/Collapse";
import { groupByCategory } from "@/lib/groupByCategory";
import { dayProgress } from "@/lib/planText";
import { type TaskIconTone, taskIconTones } from "@/lib/taskIcons";
import type { TaskView } from "@/types/plan";
import { useState } from "react";
import type { VariantChoice } from "./variantConfig";

// ── Kategorie (Provisorium) ────────────────────────────────────────────────
// plan.getDay liefert noch keine Kategorie (TaskView hat kein Feld dafür).
// Fürs Design wird sie hier aus der Farbgruppe des Icons abgeleitet. Echt:
// task.category durch dayPlan.ts → groupDayPlan → TaskView.category reichen.
const CATEGORY_BY_TONE: Record<TaskIconTone, string> = {
  sky: "Putzen & Wäsche",
  amber: "Küche",
  violet: "Erledigungen",
  pink: "Tiere",
  emerald: "Pflanzen",
  teal: "Müll",
  indigo: "Zuhause & Planung",
  lime: "Finanzen",
  rose: "Gesundheit",
  slate: "Sonstiges",
};

function categoryOf(task: TaskView) {
  return CATEGORY_BY_TONE[task.icon ? taskIconTones[task.icon] : "slate"];
}

// ── Auf/Zu-Zustand ─────────────────────────────────────────────────────────
// Anders als im Profil: Kategorien kommen und gehen je nach Tag, und eine
// Gruppe darf sich von selbst schließen, sobald alles erledigt ist. Deshalb
// gibt es einen Standard (abhängig von den Daten) und nur das, was man selbst
// umgeschaltet hat, wird gemerkt.
function useOpenOverrides() {
  const [overrides, setOverrides] = useState(new Map<string, boolean>());
  return {
    isOpen: (name: string, byDefault: boolean) =>
      overrides.get(name) ?? byDefault,
    toggle: (name: string, current: boolean) =>
      setOverrides((prev) => new Map(prev).set(name, !current)),
  };
}

export function GroupedTasks({
  tasks,
  choice,
  onSelect,
}: {
  tasks: TaskView[];
  choice: VariantChoice;
  onSelect: (taskId: string, slotId: string | null) => void;
}) {
  const groups = groupByCategory(
    tasks.map((t) => ({ ...t, category: categoryOf(t) })),
  );
  const openState = useOpenOverrides();

  return (
    <div className="m-2 flex flex-col gap-2">
      {/* "Farbige Gruppen": die Karten werden zu schlichten Zeilen mit
          Trennlinie (ungelayert → gewinnt gegen jaklib und die glass-Utilities).
          Die Linie per "* + *", weil border: 0 sonst auch divide-y schluckt. */}
      <style>{`
        .dash-flat > * {
          border-radius: 0;
          border: 0;
          background: transparent;
          box-shadow: none;
          backdrop-filter: none;
        }
        .dash-flat > * + * {
          border-top: 1px solid var(--app-line);
        }
      `}</style>

      {groups.map(({ category, items }) => {
        const { done, total } = dayProgress(items);
        const allDone = total > 0 && done === total;
        // "Erledigte zu": fertige Kategorien starten zugeklappt – und klappen
        // auch von selbst zu, sobald das Letzte erledigt ist
        const open = openState.isOpen(category, !(choice.z === 2 && allDone));
        const toggle = () => openState.toggle(category, open);
        const meta = <Progress variant={choice.k} done={done} total={total} />;
        const cards = items.map((t) => (
          <TaskCard
            key={t.taskId}
            taskView={t}
            onSelect={(slotId) => onSelect(t.taskId, slotId)}
          />
        ));

        // 3 · Überschriften: schlichte Zeile, die Karten bleiben wie bisher
        if (choice.g === 3) {
          return (
            <section key={category}>
              <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                className="flex w-full items-center gap-2 px-2 pt-2 pb-1.5"
              >
                <Glyph
                  name="chevron"
                  size={12}
                  className={`shrink-0 text-subtle transition-transform duration-300 ${
                    open ? "rotate-90" : ""
                  }`}
                />
                <span className="text-xs font-bold text-fg-2">{category}</span>
                <span className="h-px flex-1 bg-line" />
                {meta}
              </button>
              <Collapse open={open}>
                <div className="flex flex-col gap-2 pb-1">{cards}</div>
              </Collapse>
            </section>
          );
        }

        const info = { name: category, items };
        return (
          <CategoryGroup
            key={category}
            info={info}
            open={open}
            onToggle={toggle}
            meta={meta}
          >
            {choice.g === 4 ? (
              // 4 · Gruppen + Karten: die Karten bleiben Karten
              <div className="flex flex-col gap-2 p-2">{cards}</div>
            ) : (
              // 2 · Farbige Gruppen: Karten werden zu Zeilen
              <div className="dash-flat">{cards}</div>
            )}
          </CategoryGroup>
        );
      })}
    </div>
  );
}

// ── Fortschritt im Kopf (Achse k) ──────────────────────────────────────────

function Progress({
  variant,
  done,
  total,
}: {
  variant: number;
  done: number;
  total: number;
}) {
  const allDone = total > 0 && done === total;

  // 2 · Balken + Zahl
  if (variant === 2) {
    return (
      <span className="flex shrink-0 items-center gap-1.5">
        <span className="h-1.5 w-12 overflow-hidden rounded-full bg-surface/70 dark:bg-white/10">
          <span
            className="block h-full rounded-full bg-success-600 transition-[width] duration-500"
            style={{ width: `${total ? (done / total) * 100 : 0}%` }}
          />
        </span>
        <span className="text-[10px] font-semibold text-muted tabular-nums">
          {done}/{total}
        </span>
      </span>
    );
  }

  // 3 · Ring, fertig mit Häkchen
  if (variant === 3) {
    const r = 9;
    const circumference = 2 * Math.PI * r;
    return (
      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90">
          <circle
            cx="12"
            cy="12"
            r={r}
            fill="none"
            strokeWidth="2.5"
            className="stroke-black/10 dark:stroke-white/10"
          />
          <circle
            cx="12"
            cy="12"
            r={r}
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="stroke-success-600 transition-[stroke-dashoffset] duration-500"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - (total ? done / total : 0))}
          />
        </svg>
        {allDone ? (
          <Glyph name="check" size={11} className="absolute text-success-600" />
        ) : (
          <span className="absolute text-[9px] font-bold text-muted tabular-nums">
            {total - done}
          </span>
        )}
      </span>
    );
  }

  // 1 · Zähler "2/3", fertig in Grün
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
        allDone
          ? "bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300"
          : "bg-surface/70 text-muted dark:bg-white/8"
      }`}
    >
      {done}/{total}
    </span>
  );
}
