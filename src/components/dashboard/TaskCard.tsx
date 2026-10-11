import { PersonPair } from "@/components/ui/PersonPair";
import { TaskTile } from "@/components/ui/TaskTile";
import { slotStatusText } from "@/lib/planText";
import type { TaskView } from "@/types/plan";
import { Card } from "jaklib/core";
import { TaskSlotRow } from "./TaskSlotRow";

/**
 * Eine Aufgabe im Dashboard. Zwei Formen:
 * - ohne Slots: eine Zeile mit Kachel, Titel, Status-Text und Personen
 * - mit Slots: Kopf mit Kachel + Titel, darunter eine Zeile pro Slot
 *
 * `glass-card` / `glass-inset` sind eigene Klassen aus globals.css: im Dark
 * Mode Milchglas statt jaklibs deckender Karte mit Rand.
 */
export function TaskCard({
  taskView: { title, icon, slots },
  onSelect,
}: {
  taskView: TaskView;
  onSelect: (slotId: string | null) => void;
}) {
  const isCompact = slots.length === 1 && !slots[0].label;
  const isDone = slots.every((slot) => slot.status === "completed");
  const titleClass = isDone ? "text-subtle line-through" : "text-fg";

  if (isCompact) {
    const slot = slots[0];
    return (
      <Card variant="panel" className="min-h-0 overflow-hidden glass-card">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <TaskTile icon={icon} title={title} completed={isDone} />
          {/* min-w-0 + flex-1: nimmt den restlichen Platz, darf aber schrumpfen,
              damit line-clamp/truncate lange Texte kürzen können */}
          <span className="min-w-0 flex-1">
            {/* line-clamp-2: höchstens zwei Zeilen, danach "…" */}
            <span
              className={`line-clamp-2 text-xs font-semibold ${titleClass}`}
            >
              {title}
            </span>
            <span
              className={`mt-0.5 block truncate text-[11px] ${
                slot.status === "claimed" ? "text-muted" : "text-subtle"
              }`}
            >
              {slotStatusText(slot)}
            </span>
          </span>
          <PersonPair assignee={slot.assignee} completedBy={slot.completedBy} />
        </button>
      </Card>
    );
  }

  return (
    <Card variant="panel" className="min-h-0 overflow-hidden glass-card">
      <div className="flex items-center gap-3 px-4 py-3">
        <TaskTile icon={icon} title={title} completed={isDone} />
        <span className={`min-w-0 flex-1 text-xs font-semibold ${titleClass}`}>
          {title}
        </span>
      </div>
      <Card
        variant="panel"
        className="mx-2 mb-2 min-h-0 rounded-xl glass-inset p-2"
      >
        <div className="flex flex-col gap-y-2">
          {slots.map((slot) => (
            <TaskSlotRow
              key={slot.slotId}
              slot={slot}
              onSelect={() => onSelect(slot.slotId)}
            />
          ))}
        </div>
      </Card>
    </Card>
  );
}
