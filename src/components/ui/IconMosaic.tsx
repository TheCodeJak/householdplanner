import { TaskIcon } from "@/components/icons";
import { TASK_ICON_TONES, TaskIconName, taskIconTones } from "@/lib/taskIcons";

// Leicht unterschiedliche Drehungen wirken lockerer als ein starres Raster
const TILTS = ["-rotate-6", "rotate-3", "rotate-6"];

/**
 * Raster aus leicht gedrehten Pastell-Kacheln (4 pro Reihe), z.B. auf Login
 * und Registrierung. `null` ergibt eine leere Milchglas-Kachel.
 */
export function IconMosaic({ icons }: { icons: (TaskIconName | null)[] }) {
  return (
    <div className="grid grid-cols-4 gap-3 px-1" aria-hidden>
      {icons.map((name, i) => {
        const tilt = TILTS[i % TILTS.length];
        return name ? (
          <span
            key={i}
            // aspect-square: Höhe = Breite, die Kacheln skalieren mit der Spaltenbreite
            className={`flex aspect-square items-center justify-center rounded-2xl border border-glass shadow-lg shadow-brand-900/5 ${
              TASK_ICON_TONES[taskIconTones[name]]
            } ${tilt}`}
          >
            <TaskIcon name={name} size="lg" />
          </span>
        ) : (
          <span
            key={i}
            // Weißer Rand + weicher Schatten statt dunklem Rahmen: hebt sich
            // auch auf hellem Untergrund ab
            className={`aspect-square rounded-2xl border border-glass bg-surface/55 shadow-md shadow-brand-900/10 backdrop-blur ${tilt}`}
          />
        );
      })}
    </div>
  );
}
