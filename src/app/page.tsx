import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <Image src="\icon.svg" width={64} height={64} alt="" priority />
        <h1 className="text-3xl font-bold text-slate-900">
          Household Planner
        </h1>
        <p className="max-w-sm text-slate-500">
          Organisiere Haushaltsaufgaben gemeinsam mit deiner Familie — einfach,
          übersichtlich und fair aufgeteilt.
        </p>
        <div className="flex gap-3 mt-4">
          <Link
            href="/login"
            className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            Registrieren
          </Link>
        </div>
      </div>
    </div>
  );
}
