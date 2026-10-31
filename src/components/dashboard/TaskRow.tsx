"use client";

import { Glyph } from "@/components/icons";
import { Collapse } from "@/components/ui/Collapse";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import { SlotIcon } from "@/components/ui/SlotIcon";
import { useOpenState } from "@/hooks/useOpenState";
import { slotSentence, slotShort } from "@/lib/slotText";
import type { TaskIconTone } from "@/lib/taskIcons";
import type { Person, SlotView, TaskView } from "@/types/plan";
import { SoftTile } from "./SoftTile";

/**
 * Eine Aufgabe als schlichte Zeile innerhalb einer Gruppe (ohne eigene Karte,
 * ohne Trennlinie). Zwei Formen:
 * - ohne Zeitfenster: eine Zeile mit Kachel, Titel, Status-Satz und Person
 * - mit Zeitfenstern: Kopf mit Kachel + Titel zum Auf- und Zuklappen, darunter
 *   alle Zeitfenster in einem abgerundeten Kasten
 */
export function TaskRow({
  task: { taskId, title, icon, slots },
  tone,
  onSelect,
}: {
  task: TaskView;
  /** Farbe der Kategorie, in der die Aufgabe steht */
  tone: TaskIconTone;
  onSelect: (slotId: string | null) => void;
}) {
  const doneCount = slots.filter((slot) => slot.status === "completed").length;
  const isDone = doneCount === slots.length;
  const titleClass = isDone ? "text-subtle line-through" : "text-fg";

  // Wie bei den Gruppen: Fertige Aufgaben starten zu (und klappen von selbst
  // zu, sobald das Letzte erledigt ist); gemerkt wird nur, was man selbst
  // umgeschaltet hat, auch über Seitenwechsel hinweg.
  const openState = useOpenState("dashboard-tasks");
  const open = openState.isOpen(taskId, !isDone);

  // Ein Slot ohne Beschriftung: eine ganze Zeile zum Antippen
  if (slots.length === 1 && !slots[0].label) {
    const slot = slots[0];
    const who: Person | null =
      slot.status === "completed"
        ? (slot.completedBy ?? slot.assignee)
        : slot.assignee;
    return (
      <button
        type="button"
        onClick={() => onSelect(slot.slotId)}
        className="flex w-full items-center gap-3 px-3 py-2 text-left"
      >
        <SoftTile icon={icon} title={title} completed={isDone} tone={tone} />
        {/* min-w-0 + flex-1: nimmt den restlichen Platz, darf aber schrumpfen,
            damit line-clamp/truncate lange Texte kürzen können */}
        <span className="min-w-0 flex-1">
          {/* line-clamp-2: höchstens zwei Zeilen, danach "…" */}
          <span
            className={`line-clamp-2 block text-body font-semibold ${titleClass}`}
          >
            {title}
          </span>
          <span
            className={`mt-0.5 line-clamp-2 block text-secondary leading-snug ${
              slot.status === "claimed" ? "text-muted" : "text-subtle"
            }`}
          >
            {slotSentence(slot)}
          </span>
        </span>
        {who && slot.status !== "open" && (
          <PersonAvatar person={who} size={28} />
        )}
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => openState.set(taskId, !open)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-3 py-2 text-left"
      >
        <SoftTile icon={icon} title={title} completed={isDone} tone={tone} />
        <span className="min-w-0 flex-1">
          <span className={`block text-body font-semibold ${titleClass}`}>
            {title}
          </span>
          <span className="mt-0.5 block truncate text-secondary text-subtle">
            {doneCount} von {slots.length} erledigt
          </span>
        </span>
        {/* Zugeklappt zeigen kleine Kreise den Stand der Zeitfenster. Aufgeklappt
            bleiben sie unsichtbar, nehmen aber ihren Platz ein, damit der
            Titel nicht springt. */}
        <span
          className={`flex items-center gap-1 transition-opacity duration-200 motion-reduce:transition-none ${
            open ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden
        >
          {slots.map((slot) => (
            <StatusDot key={slot.slotId} slot={slot} />
          ))}
        </span>
        <Glyph
          name="chevron"
          size={14}
          className={`shrink-0 text-subtle transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>
      <Collapse open={open}>
        <SlotBox slots={slots} onSelect={onSelect} />
      </Collapse>
    </div>
  );
}

// Die Farben der Zeitfenster (--slot-*) setzt der Behälter, siehe SlotIcon.tsx.

/** Kleiner Kreis für den zugeklappten Kopf: gefüllt = erledigt, Ring = übernommen */
function StatusDot({ slot }: { slot: SlotView }) {
  if (slot.status === "open") {
    return (
      <span className="block h-2.5 w-2.5 rounded-full border-2 border-slate-300 dark:border-white/25" />
    );
  }
  return (
    <span
      className="block h-2.5 w-2.5 rounded-full"
      style={
        slot.status === "completed"
          ? { backgroundColor: "var(--slot-done)" }
          : { border: "2px solid var(--slot-claimed)" }
      }
    />
  );
}

/**
 * Alle Zeitfenster einer Aufgabe in einem abgerundeten Kasten mit dezentem
 * Rahmen, dünne Striche zwischen den Zeilen. Nur das Icon ist farbig.
 */
function SlotBox({
  slots,
  onSelect,
}: {
  slots: SlotView[];
  onSelect: (slotId: string | null) => void;
}) {
  return (
    <div className="mx-3 mt-0.5 mb-2.5 overflow-hidden rounded-2xl bg-(--slot-box) ring-1 ring-(color:--slot-line)">
      <div className="divide-y divide-(--slot-line)">
        {slots.map((slot) => (
          <button
            key={slot.slotId}
            type="button"
            onClick={() => onSelect(slot.slotId)}
            aria-label={`${slot.label}: ${slotSentence(slot)}`}
            // pl-2: Die Mitte des Icons liegt dann bei 12 (Rand des Kastens) + 8 + 12
            // = 32 px, genau unter der Mitte der 40-px-Kachel der Aufgabe
            className="flex min-h-11 w-full items-center gap-3 py-2 pr-3 pl-2 text-left"
          >
            <SlotIcon status={slot.status} />
            <span className="min-w-0 flex-1 truncate text-secondary font-semibold text-fg">
              {slot.label}
            </span>
            <span
              className={`max-w-[45%] shrink-0 truncate text-secondary ${
                slot.status === "open" ? "text-subtle" : "text-fg-2"
              }`}
            >
              {slotShort(slot)}
            </span>
            <Glyph name="chevron" size={14} className="shrink-0 text-subtle" />
          </button>
        ))}
      </div>
    </div>
  );
}
