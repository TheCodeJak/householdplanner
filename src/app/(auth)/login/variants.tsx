// ⚠️ TEMPORÄR: Design-Varianten der Login-Seite zum Durchklicken (?v=a|b|c|d). Ohne ?v= wird die
// übernommene Variante E aus AuthShell angezeigt.
// Kann samt Umschalter (VariantSwitcher in login/page.tsx) gelöscht werden,
// sobald die Entscheidung endgültig ist.

import { TaskIcon } from "@/app/components/icons";
import {
  TASK_ICON_TONES,
  TaskIconName,
  taskIconTones,
} from "@/lib/taskIcons";
import Image from "next/image";
import Link from "next/link";
import { CSSProperties, ReactNode } from "react";
import { LoginForm } from "./form";

export const LOGIN_VARIANTS = {
  current: "Mosaik + Glas (übernommen)",
  a: "Hero + Sheet",
  b: "Pastell-Mosaik",
  c: "Minimal & bold",
  d: "Glas",
} as const;

export type LoginVariant = keyof typeof LOGIN_VARIANTS;

// jaklib-Komponenten lesen ihre Optik aus CSS-Variablen – die lassen sich pro
// Variante am Wrapper überschreiben, ohne die Komponenten anzufassen.
const tokens = (t: Record<string, string>) => t as CSSProperties;

const softFields = tokens({
  "--input-bg": "#f1f5f9",
  "--input-border": "transparent",
  "--input-label": "#475569",
  "--radius-md": "14px",
  "--h-md": "52px",
  "--primary-shadow": "transparent",
  "--primary-shadow-hover": "transparent",
});

function RegisterLink({ className = "" }: { className?: string }) {
  return (
    <p className={`text-center text-sm text-muted ${className}`}>
      Noch kein Konto?{" "}
      <Link
        href="/register"
        className="inline-block py-2 font-semibold text-brand-600 hover:text-brand-700"
      >
        Registrieren
      </Link>
    </p>
  );
}

// ─────────────────────────────────────────────
// A · Farbiger Hero oben, Formular als „Sheet“ darüber
// ─────────────────────────────────────────────
const HERO_ICONS: { name: TaskIconName; className: string }[] = [
  { name: "kochen", className: "right-6 top-10 rotate-12" },
  { name: "waschen", className: "right-24 top-28 -rotate-6" },
  { name: "hund", className: "right-4 top-44 rotate-6" },
  { name: "einkaufen", className: "right-32 top-6 -rotate-12" },
  { name: "pflanzen", className: "right-44 top-40 rotate-3" },
];

function VariantHero() {
  return (
    <main className="min-h-dvh bg-surface-2 sm:flex sm:items-center sm:justify-center sm:py-10">
      <div className="flex min-h-dvh w-full flex-col bg-surface sm:min-h-0 sm:max-w-md sm:overflow-hidden sm:rounded-[28px] sm:shadow-xl">
        <div className="relative overflow-hidden bg-linear-to-br from-brand-500 to-amber-400 px-6 pt-16 pb-14 text-white">
          {HERO_ICONS.map(({ name, className }) => (
            <TaskIcon
              key={name}
              name={name}
              size="xl"
              className={`absolute opacity-25 ${className}`}
            />
          ))}
          <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-surface shadow-lg shadow-brand-700/20">
            <Image src="/icon.svg" width={34} height={34} alt="" priority />
          </span>
          <h1 className="relative mt-6 text-3xl font-bold tracking-tight">
            Willkommen zurück 👋
          </h1>
          <p className="relative mt-1.5 text-white/85">
            Schön, dass du wieder da bist.
          </p>
        </div>

        <div
          className="relative -mt-6 flex flex-1 flex-col rounded-t-[28px] bg-surface px-6 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          style={softFields}
        >
          <LoginForm />
          <RegisterLink className="mt-auto pt-8" />
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// B · Pastell-Kacheln wie in den TaskCards als Illustration
// ─────────────────────────────────────────────
const MOSAIC: (TaskIconName | null)[] = [
  "kochen", null, "waschen", "hund",
  null, "einkaufen", "pflanzen", null,
  "muell", "kalender", null, "apotheke",
];

function VariantMosaic() {
  return (
    <main className="flex min-h-dvh flex-col bg-surface-2 px-6 pt-16 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:items-center sm:justify-center">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col sm:flex-none">
        <div className="grid grid-cols-4 gap-3" aria-hidden>
          {MOSAIC.map((name, i) =>
            name ? (
              <span
                key={i}
                className={`flex aspect-square items-center justify-center rounded-2xl ${
                  TASK_ICON_TONES[taskIconTones[name]]
                } ${i % 3 === 0 ? "-rotate-6" : i % 3 === 1 ? "rotate-3" : "rotate-6"}`}
              >
                <TaskIcon name={name} size="lg" />
              </span>
            ) : (
              <span
                key={i}
                className="aspect-square rounded-2xl border-2 border-dashed border-line"
              />
            ),
          )}
        </div>

        <h1 className="mt-10 text-[2rem] leading-[1.1] font-bold tracking-tight text-fg">
          Gemeinsam den Haushalt im Griff.
        </h1>
        <p className="mt-2 mb-8 text-muted">Melde dich an, um loszulegen.</p>

        <div
          style={tokens({
            "--input-bg": "#ffffff",
            "--input-border": "#e7e5e4",
            "--input-label": "#475569",
            "--radius-md": "14px",
            "--h-md": "52px",
            "--primary-shadow": "transparent",
            "--primary-shadow-hover": "transparent",
          })}
        >
          <LoginForm />
        </div>
        <RegisterLink className="mt-auto pt-8 sm:mt-6 sm:pt-0" />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// C · Viel Weißraum, große Typo, Pillen-Formen
// ─────────────────────────────────────────────
function VariantBold() {
  return (
    <main className="flex min-h-dvh flex-col bg-surface px-6 pt-16 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:items-center sm:justify-center">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col sm:flex-none">
        <div className="flex items-center gap-2">
          <Image src="/icon.svg" width={28} height={28} alt="" priority />
          <span className="text-sm font-semibold text-fg">
            Household Planner
          </span>
        </div>

        <h1 className="mt-14 text-[2.6rem] leading-[1.05] font-extrabold tracking-tight text-fg">
          Hallo!
          <br />
          <span className="text-brand-600">Schön, dich zu sehen.</span>
        </h1>
        <p className="mt-3 mb-10 text-muted">
          Melde dich an und schau, was heute ansteht.
        </p>

        <div
          style={tokens({
            "--input-bg": "#f5f5f4",
            "--input-border": "transparent",
            "--input-label": "#57534e",
            "--radius-md": "9999px",
            "--h-md": "56px",
            "--h-lg": "56px",
            "--primary-shadow": "transparent",
            "--primary-shadow-hover": "transparent",
          })}
        >
          <LoginForm />
        </div>
        <RegisterLink className="mt-auto pt-8 sm:mt-6 sm:pt-0" />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// D · Weiche Farbflächen im Hintergrund, Milchglas-Karte
// ─────────────────────────────────────────────
function VariantGlass() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-orange-50 px-5 py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-brand-300/70 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-pink-300/60 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-amber-200/80 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-surface/80 shadow-lg shadow-brand-500/10 backdrop-blur">
            <Image src="/icon.svg" width={38} height={38} alt="" priority />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-fg">
            Willkommen zurück
          </h1>
          <p className="mt-1 text-sm text-fg-2">
            Melde dich an, um deinen Haushalt zu planen.
          </p>
        </div>

        <div
          className="rounded-3xl border border-glass bg-surface/60 p-6 shadow-xl shadow-brand-900/5 backdrop-blur-xl"
          style={tokens({
            "--input-bg": "rgba(255,255,255,0.85)",
            "--input-border": "rgba(255,255,255,0.9)",
            "--input-label": "#475569",
            "--radius-md": "14px",
            "--h-md": "50px",
          })}
        >
          <LoginForm />
        </div>
        <RegisterLink className="mt-4" />
      </div>
    </main>
  );
}

export function LoginVariantView({ variant }: { variant: LoginVariant }) {
  if (variant === "a") return <VariantHero />;
  if (variant === "b") return <VariantMosaic />;
  if (variant === "c") return <VariantBold />;
  if (variant === "d") return <VariantGlass />;
  return null;
}

export function VariantSwitcher({
  active,
  children,
}: {
  active: LoginVariant;
  children: ReactNode;
}) {
  return (
    <>
      {children}
      <nav className="fixed top-[max(0.5rem,env(safe-area-inset-top))] left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-full bg-slate-900/85 p-1 text-xs font-medium text-white shadow-lg backdrop-blur">
        {(Object.keys(LOGIN_VARIANTS) as LoginVariant[]).map((key) => (
          <Link
            key={key}
            href={key === "current" ? "/login" : `/login?v=${key}`}
            replace
            scroll={false}
            title={LOGIN_VARIANTS[key]}
            className={`rounded-full px-3 py-1.5 ${
              key === active ? "bg-surface text-fg" : "text-white/80"
            }`}
          >
            {key === "current" ? "E" : key.toUpperCase()}
          </Link>
        ))}
      </nav>
    </>
  );
}
