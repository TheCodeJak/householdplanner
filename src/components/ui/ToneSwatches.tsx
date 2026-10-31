import { Glyph } from "@/components/icons";
import {
  TASK_TONE_CHOICES,
  TASK_TONE_HEX,
  TASK_TONE_LABELS,
  type TaskIconTone,
} from "@/lib/taskIcons";

/**
 * Farbauswahl für Kategorien: 15 große Farbpunkte in drei Reihen, die
 * gewählte mit Häkchen und Ring. Jeder Punkt hat den Farbnamen als
 * Beschriftung (aria-label), die Farbe allein sagt nicht jedem etwas.
 *
 * Eine ältere Farbe, die hier nicht mehr angeboten wird, bleibt gültig und
 * erscheint in der Auswahl nur nicht als gewählt, bis man eine andere nimmt.
 */
export function ToneSwatches({
  value,
  onChange,
}: {
  value: TaskIconTone;
  onChange: (tone: TaskIconTone) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Farbe"
      className="grid grid-cols-5 justify-items-center gap-y-3"
    >
      {TASK_TONE_CHOICES.map((tone) => {
        const selected = tone === value;
        return (
          <button
            key={tone}
            type="button"
            onClick={() => onChange(tone)}
            aria-label={TASK_TONE_LABELS[tone]}
            title={TASK_TONE_LABELS[tone]}
            aria-pressed={selected}
            // Farbe ist ein Laufzeitwert aus der Palette → inline statt Tailwind-Klasse
            style={{ backgroundColor: TASK_TONE_HEX[tone][600] }}
            className={`flex h-11 w-11 items-center justify-center rounded-full text-white transition ${
              selected
                ? "ring-2 ring-fg ring-offset-2 ring-offset-surface-2"
                : "hover:scale-105"
            }`}
          >
            {selected && <Glyph name="check" size={18} />}
          </button>
        );
      })}
    </div>
  );
}
