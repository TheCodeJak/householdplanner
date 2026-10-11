import type { TaskStatus } from "@/types/plan";

// Klassen müssen vollständig ausgeschrieben sein (nicht z.B. `bg-${farbe}-100`),
// sonst findet Tailwind sie beim Build nicht und erzeugt kein CSS dafür.
// `dark:` gilt, wenn das Gerät im Dark Mode ist (prefers-color-scheme).
const PILLS: Record<TaskStatus, { label: string; className: string }> = {
  open: {
    label: "Offen",
    className: "bg-surface/70 text-muted",
  },
  claimed: {
    label: "Übernommen",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300",
  },
  completed: {
    label: "Erledigt",
    className:
      "bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300",
  },
};

/** Farbiges Status-Etikett: Offen / Übernommen / Erledigt */
export function StatusPill({ status }: { status: TaskStatus }) {
  const pill = PILLS[status];
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${pill.className}`}
    >
      {pill.label}
    </span>
  );
}
