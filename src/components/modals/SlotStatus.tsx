import { PersonAvatar } from "@/components/ui/PersonAvatar";
import { slotSentence } from "@/lib/slotText";
import type { SlotView } from "@/types/plan";

/**
 * Stand eines Zeitfensters im Aufgaben-Dialog, in einer Zeile: Avatar der
 * Person, um die es geht, und ein Satz („Du bist dran“, „Von Laura für dich
 * erledigt“, „Noch frei“). Der Satz sagt schon den Status, deshalb gibt es keine
 * eigene Pille. Jede Angabe steht so genau einmal da.
 * - Person: wer erledigt hat, sonst wer übernommen hat; frei = gestrichelter Kreis
 * - erledigt: kleiner grüner Haken am Avatar
 */
export function SlotStatus({ slot }: { slot: SlotView }) {
  const person =
    slot.status === "completed"
      ? (slot.completedBy ?? slot.assignee)
      : slot.assignee;

  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="relative shrink-0">
        {person ? (
          <PersonAvatar person={person} size={36} />
        ) : (
          <span className="block h-9 w-9 rounded-full border-2 border-dashed border-slate-300 dark:border-white/25" />
        )}
        {slot.status === "completed" && (
          <span
            aria-hidden
            className="absolute -right-0.5 -bottom-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-green-600 text-white ring-2 ring-surface"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
        )}
      </span>
      <p className="min-w-0 text-body font-semibold text-fg">
        {slotSentence(slot)}
      </p>
    </div>
  );
}
