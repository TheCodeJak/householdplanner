import type { TaskStatus } from "@/types/plan";

const SIZE = 28;

/**
 * Status-Kreis einer Slot-Zeile:
 * offen = leerer Kreis, übernommen = orangefarbenes Häkchen, erledigt = grünes.
 */
export function TaskStatusIcon({ status }: { status: TaskStatus }) {
  if (status === "open") {
    return (
      <span
        // border-subtle/50: Randfarbe "subtle" mit 50 % Deckkraft;
        // bg-surface füllt ihn, damit er auf der grauen Slot-Fläche sichtbar bleibt
        className="block shrink-0 rounded-full border-[1.5px] border-subtle/50 bg-surface"
        style={{ width: SIZE, height: SIZE }}
      />
    );
  }

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox="0 0 28 28"
      fill="none"
      // Kreis nutzt fill="currentColor" → die Farbe kommt aus dieser Textklasse
      className={`shrink-0 ${status === "completed" ? "text-green-600" : "text-orange-500"}`}
    >
      <circle cx="14" cy="14" r="14" fill="currentColor" />
      <path
        d="M9 14.2l3.2 3.2 6.8-6.8"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
