import { TaskIcon } from "@/components/icons";
import { TASK_ICON_TONES, TaskIconName, taskIconTones } from "@/lib/taskIcons";
import type { CSSProperties } from "react";

/**
 * Drei Pastell-Kacheln, die zeitversetzt sanft auf und ab schweben:
 * eine große in der Mitte, zwei kleine daneben (Illustration für ComingSoon).
 */
export function FloatingTiles({
  icons: [main, left, right],
}: {
  icons: [TaskIconName, TaskIconName, TaskIconName];
}) {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <div className="mt-12">
        <Tile name={left} large={false} tilt={-10} delay={0.6} />
      </div>
      <Tile name={main} large tilt={3} delay={0} />
      <div className="-mt-12">
        <Tile name={right} large={false} tilt={9} delay={1.2} />
      </div>
    </div>
  );
}

function Tile({
  name,
  large,
  tilt,
  delay,
}: {
  name: TaskIconName;
  large: boolean;
  tilt: number;
  delay: number;
}) {
  return (
    <span
      // motion-safe:animate-float → Animation "float" aus globals.css, aber nur,
      // wenn auf dem Gerät NICHT "Bewegung reduzieren" eingeschaltet ist
      className={`flex items-center justify-center border border-glass shadow-lg shadow-brand-900/10 motion-safe:animate-float ${
        large ? "h-24 w-24 rounded-[28px]" : "h-16 w-16 rounded-2xl"
      } ${TASK_ICON_TONES[taskIconTones[name]]}`}
      style={
        {
          // Die Animation liest --tilt, damit die Drehung beim Schweben bleibt.
          // `transform` gilt nur ohne Animation (bei "Bewegung reduzieren").
          "--tilt": `${tilt}deg`,
          transform: `rotate(${tilt}deg)`,
          animationDelay: `${delay}s`,
        } as CSSProperties
      }
    >
      <TaskIcon name={name} size={large ? "xl" : "lg"} />
    </span>
  );
}
