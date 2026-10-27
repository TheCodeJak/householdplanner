import { Card } from "jaklib/core";

// Unterschiedliche Titelbreiten wirken natürlicher als lauter gleich lange Balken
const TITLE_WIDTHS = ["w-28", "w-36", "w-24", "w-32", "w-20"];

/**
 * Platzhalter beim ersten Laden: angedeutete Karten in der Form der echten
 * Aufgaben. Das Layout springt so nicht, wenn die Daten kommen, und man sieht
 * schon, was gleich erscheint.
 *
 * motion-safe:animate-pulse: Tailwinds Puls-Animation (Deckkraft auf und ab),
 * aber nur, wenn auf dem Gerät nicht "Bewegung reduzieren" aktiv ist.
 */
export function TaskListSkeleton() {
  return (
    // role="status": Screenreader sagen "Aufgaben werden geladen" an,
    // die grauen Balken selbst sind für sie unsichtbar (aria-hidden)
    <div role="status" className="m-2 flex flex-col gap-2">
      <span className="sr-only">Aufgaben werden geladen</span>
      {TITLE_WIDTHS.map((width, i) => (
        <Card
          key={width}
          variant="panel"
          className="min-h-0 glass-card"
          aria-hidden
        >
          <div
            className="flex items-center gap-3 px-4 py-3 motion-safe:animate-pulse"
            // Versetzter Start: die Karten pulsieren wie eine leichte Welle
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <span className="h-10 w-10 shrink-0 rounded-xl bg-line dark:bg-white/8" />
            <span className="flex-1 space-y-2">
              <span
                className={`block h-3 rounded-full bg-line dark:bg-white/8 ${width}`}
              />
              <span className="block h-2.5 w-16 rounded-full bg-line/70 dark:bg-white/6" />
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
