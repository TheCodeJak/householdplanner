import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <Image src="\icon.svg" width={64} height={64} alt="" priority />
        <h1 className="text-3xl font-bold text-fg">Household Planner</h1>
        <p className="max-w-sm text-muted">
          Organisiere Haushaltsaufgaben gemeinsam mit deiner Familie — einfach,
          übersichtlich und fair aufgeteilt.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-line bg-surface px-6 py-2.5 text-sm font-semibold text-fg-2 shadow-sm transition-colors hover:bg-surface-2"
          >
            Registrieren
          </Link>
        </div>
      </div>
    </div>
  );
}
