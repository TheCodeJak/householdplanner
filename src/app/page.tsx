import { Glyph } from "@/components/icons";
import { AuthShell } from "@/components/layout/AuthShell";
import Link from "next/link";

const FEATURES = [
  "Alle Aufgaben des Tages im Blick",
  "Übernehmen und abhaken",
  "Fair aufgeteilt in der Familie",
];

// Links im Aussehen der jaklib-Buttons in AuthShell (52 px hoch, 14 px Radius)
const linkButton =
  "flex h-[52px] items-center justify-center rounded-[14px] text-body font-semibold transition-colors";

// Startseite für nicht Angemeldete; im gleichen Rahmen wie Login und
// Registrierung, damit der erste Eindruck schon nach der App aussieht.
export default function LandingPage() {
  return (
    <AuthShell
      title="Haushalt, gemeinsam geplant"
      subtitle="Organisiere Haushaltsaufgaben mit deiner Familie – einfach, übersichtlich und fair aufgeteilt."
      icons={["einkaufen", "kochen", null, "waschen"]}
      footer="In der Beta nur mit Registrierungscode."
    >
      <ul className="mb-5 flex flex-col gap-2.5">
        {FEATURES.map((text) => (
          <li key={text} className="flex items-center gap-2.5 text-fg-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-accent">
              <Glyph name="check" size={14} />
            </span>
            {text}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-3">
        <Link
          href="/login"
          className={`${linkButton} bg-primary text-on-primary hover:bg-primary-hover`}
        >
          Anmelden
        </Link>
        <Link
          href="/register"
          className={`${linkButton} border border-line bg-surface text-fg hover:bg-surface-2`}
        >
          Konto erstellen
        </Link>
      </div>
    </AuthShell>
  );
}
