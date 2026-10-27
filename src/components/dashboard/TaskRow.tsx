"use client";

import { Glyph } from "@/components/icons";
import { Collapse } from "@/components/ui/Collapse";
import { PersonPair } from "@/components/ui/PersonPair";
import { TaskTile } from "@/components/ui/TaskTile";
import { useOpenState } from "@/hooks/useOpenState";
import { slotStatusText } from "@/lib/planText";
import type { SlotView, TaskStatus, TaskView } from "@/types/plan";

/**
 * Eine Aufgabe als schlichte Zeile innerhalb einer Gruppe (ohne eigene Karte,
 * ohne Trennlinie). Zwei Formen:
 * - ohne Zeitfenster: eine Zeile mit Kachel, Titel, Status-Text und Personen
 * - mit Zeitfenstern: Kopf mit Kachel + Titel zum Auf- und Zuklappen, darunter
 *   der Zeitstrahl, der mittig an der Kachel hängt
 */
export function TaskRow({
  task: { taskId, title, icon, slots },
  onSelect,
}: {
  task: TaskView;
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
    return (
      <button
        type="button"
        onClick={() => onSelect(slot.slotId)}
        className="flex w-full items-center gap-3 px-3 py-2 text-left"
      >
        <TaskTile icon={icon} title={title} completed={isDone} />
        {/* min-w-0 + flex-1: nimmt den restlichen Platz, darf aber schrumpfen,
            damit line-clamp/truncate lange Texte kürzen können */}
        <span className="min-w-0 flex-1">
          {/* line-clamp-2: höchstens zwei Zeilen, danach "…" */}
          <span
            className={`line-clamp-2 block text-xs font-semibold ${titleClass}`}
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
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => openState.set(taskId, !open)}
        aria-expanded={open}
        className="relative flex w-full items-center gap-3 px-3 py-2 text-left"
      >
        <TaskTile icon={icon} title={title} completed={isDone} />
        <span className="min-w-0 flex-1">
          <span className={`block text-xs font-semibold ${titleClass}`}>
            {title}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-subtle">
            {doneCount} von {slots.length} erledigt
          </span>
        </span>
        {/* Zugeklappt zeigen Punkte den Stand der Zeitfenster. Aufgeklappt
            bleiben sie unsichtbar, nehmen aber ihren Platz ein, damit der
            Titel nicht springt. */}
        <span
          className={`flex items-center gap-1 transition-opacity duration-200 motion-reduce:transition-none ${
            open ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden
        >
          {slots.map((slot) => (
            <StatusDot key={slot.slotId} status={slot.status} />
          ))}
        </span>
        <Glyph
          name="chevron"
          size={14}
          className={`shrink-0 text-subtle transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            open ? "rotate-90" : ""
          }`}
        />
        {/* Linienstück von der Unterkante der Kachel bis zum Zeitstrahl:
            12 px Zeilenrand + 20 px (halbe Kachel) − 0,75 px (halbe Linie).
            h-2 = das Polster unter der Kachel. */}
        <span
          aria-hidden
          className={`absolute bottom-0 left-[31.25px] h-2 w-[1.5px] bg-slate-300 transition-opacity duration-200 motion-reduce:transition-none dark:bg-white/15 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
      </button>
      <Collapse open={open}>
        <SlotTimeline slots={slots} onSelect={onSelect} />
      </Collapse>
    </div>
  );
}

// Farbe des Status-Worts rechts in der Zeile
const STATUS_TONE: Record<TaskStatus, string> = {
  open: "text-subtle",
  claimed: "text-orange-600 dark:text-orange-300",
  completed: "text-green-700 dark:text-green-300",
};

/** Kurzes Status-Wort: "Frei", "Du" oder der Name */
function shortStatus(slot: SlotView) {
  if (slot.status === "open") return "Frei";
  const who = slot.completedBy ?? slot.assignee;
  if (!who) return slot.status === "completed" ? "Erledigt" : "Übernommen";
  return who.isCurrentUser ? "Du" : who.name;
}

/** Kleiner Punkt für den zugeklappten Kopf: gleiche Farben wie der Knoten */
function StatusDot({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`block h-2.5 w-2.5 rounded-full ${
        status === "completed"
          ? "bg-green-600"
          : status === "claimed"
            ? "border-2 border-orange-500"
            : "border-2 border-slate-300 dark:border-white/25"
      }`}
    />
  );
}

/**
 * Knoten der Zeitleiste (18 px): erledigt = grüner Kreis mit Häkchen,
 * übernommen = orangefarbener Ring mit Loch, offen = grauer Ring.
 */
function TimelineNode({ status }: { status: TaskStatus }) {
  if (status === "completed") {
    return (
      <span
        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-green-600 text-white"
        aria-hidden
      >
        <Glyph name="check" size={11} />
      </span>
    );
  }
  return (
    <span
      className={`block h-[18px] w-[18px] shrink-0 rounded-full border-[3.5px] ${
        status === "claimed"
          ? "border-orange-500"
          : "border-slate-300 dark:border-white/25"
      }`}
      aria-hidden
    />
  );
}

/**
 * Zeitstrahl: Die Zeitfenster sitzen als Knoten auf einer senkrechten Linie,
 * die mittig unter der Kachel der Aufgabe verläuft; rechts Status-Wort und
 * Pfeil. Jede Zeile zeichnet nur das Stück Linie zwischen ihrem Knoten und
 * dem der Nachbarzeile (die erste auch das Stück bis zur Kachel), so läuft
 * die Linie nie durch das Loch eines Rings.
 */
function SlotTimeline({
  slots,
  onSelect,
}: {
  slots: SlotView[];
  onSelect: (slotId: string | null) => void;
}) {
  // Linienstück: 1,5 px breit, mittig unter dem 18-px-Knoten, reicht bis an
  // den Knotenrand (50 % der Zeile − 9 px Knotenradius). left-[19.25px] =
  // 11 px Zeilenpolster + 9 px halber Knoten − 0,75 px halbe Linie.
  const line =
    "absolute left-[19.25px] h-[calc(50%-9px)] w-[1.5px] bg-slate-300 dark:bg-white/15";

  return (
    <div className="flex flex-col px-3 pb-2">
      {slots.map((slot, i) => (
        <button
          key={slot.slotId}
          type="button"
          onClick={() => onSelect(slot.slotId)}
          aria-label={`${slot.label}: ${slotStatusText(slot)}`}
          // pl-[11px]: 12 px Rand + 11 px = der Knoten (18 px) sitzt mittig
          // unter der 40-px-Kachel (12 + 20 = 32 = 23 + 9)
          className="relative flex min-h-8 w-full items-center gap-3 pl-[11px] text-left"
        >
          <span aria-hidden className={`top-0 ${line}`} />
          {i < slots.length - 1 && (
            <span aria-hidden className={`bottom-0 ${line}`} />
          )}
          <TimelineNode status={slot.status} />
          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-fg">
            {slot.label}
          </span>
          <span
            className={`w-20 shrink-0 truncate text-xs font-semibold ${STATUS_TONE[slot.status]}`}
          >
            {shortStatus(slot)}
          </span>
          <Glyph name="chevron" size={14} className="shrink-0 text-subtle" />
        </button>
      ))}
    </div>
  );
}
