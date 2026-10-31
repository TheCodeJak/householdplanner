import { isMine } from "@/lib/mine";
import type { Person, SlotView } from "@/types/plan";

const SIZE = 28;
const R = 11;
/** Alles, was nicht mir gehört, ist neutral grau */
const NEUTRAL = "var(--app-muted)";

/** Dicke eines Segments: meine erledigten, die der anderen */
const STROKE_DONE = 5;
const STROKE_OTHER = 3;
/** „Von mir übernommen, noch nicht erledigt“: matter und dünner als erledigt */
const CLAIMED = { opacity: 0.6, width: 3 };

/** Ein Kreisbogen auf dem Ring; Winkel in Grad ab 12 Uhr, im Uhrzeigersinn */
function Arc({
  from,
  length,
  color,
  opacity,
  width,
}: {
  from: number;
  length: number;
  color: string;
  opacity: number;
  width: number;
}) {
  return (
    <circle
      cx={SIZE / 2}
      cy={SIZE / 2}
      r={R}
      fill="none"
      style={{ stroke: color }}
      strokeOpacity={opacity}
      strokeWidth={width}
      // pathLength 360: Länge und Anfang des Bogens in Grad
      pathLength={360}
      strokeDasharray={`${length} ${360 - length}`}
      strokeDashoffset={-from}
      transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
    />
  );
}

/**
 * Fortschritt einer Kategorie und „hier bin ich dabei“ in einem Bild: ein Ring
 * mit einem Segment je Zeitfenster, daneben "erledigt/gesamt".
 * - Nur meine Segmente haben Farbe (meine Personenfarbe), alle anderen sind grau.
 *   Die Kategoriefarbe kommt hier nicht vor (die zeigt schon der Kopf), so kann
 *   eine Farbe nur „ich“ bedeuten.
 * - Erledigt ist voll und, wenn es meins ist, dick. Von mir übernommen, aber
 *   noch offen: dieselbe Farbe, matter und dünner.
 */
export function CategoryRing({
  slots,
  done,
  total,
  me,
}: {
  slots: SlotView[];
  done: number;
  total: number;
  /** Ich selbst; null, solange die Sitzung noch lädt */
  me: Person | null;
}) {
  const n = slots.length;
  // Bei sehr vielen Zeitfenstern würden die Lücken die Segmente auffressen
  const gap = n > 1 && n <= 12 ? 16 : 0;
  const step = 360 / n;
  const mineCount = me ? slots.filter(isMine).length : 0;
  const mineDone = me
    ? slots.filter((s) => isMine(s) && s.status === "completed").length
    : 0;
  const label = `${done} von ${total} erledigt${
    mineCount ? `, davon ${mineDone} von ${mineCount} von dir` : ""
  }`;

  return (
    <span
      role="img"
      aria-label={label}
      className="flex shrink-0 items-center gap-2"
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden
      >
        {slots.map((slot, i) => {
          const completed = slot.status === "completed";
          const look =
            me && isMine(slot)
              ? completed
                ? { color: me.color, opacity: 1, width: STROKE_DONE }
                : { color: me.color, ...CLAIMED }
              : {
                  color: NEUTRAL,
                  opacity: completed ? 0.7 : 0.2,
                  width: STROKE_OTHER,
                };
          return (
            <Arc
              key={i}
              from={i * step + gap / 2}
              length={step - gap}
              {...look}
            />
          );
        })}
      </svg>
      {/* fg-2 statt muted: auf dem getönten Gruppenkopf reicht muted dunkel nicht für 4,5:1 */}
      <span className="text-caption font-semibold text-fg-2 tabular-nums">
        {done}/{total}
      </span>
    </span>
  );
}
