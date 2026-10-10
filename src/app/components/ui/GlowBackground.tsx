// Weiche, verschwommene Farbflächen als Hintergrund für Login/Registrierung.
// Der Eltern-Container braucht `relative overflow-hidden`, der Inhalt darüber `relative`.
export function GlowBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-brand-300/70 blur-3xl dark:bg-brand-600/30" />
      <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-pink-300/60 blur-3xl dark:bg-pink-600/20" />
      <div className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-amber-200/80 blur-3xl dark:bg-amber-500/15" />
    </div>
  );
}

// Hintergrund der Hauptapp: sehr helle Pastellflächen über die ganze Seite
// (bleiben beim Scrollen stehen) plus ein etwas kräftigerer warmer Schimmer
// oben, der nach unten ausblendet und mitscrollt.
// Liegt hinter dem Inhalt – der Eltern-Container braucht `relative isolate`.
export function AppBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-page"
      >
        <div className="absolute top-1/4 -right-32 h-96 w-96 rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-500/8" />
        <div className="absolute bottom-0 -left-24 h-96 w-96 rounded-full bg-violet-200/35 blur-3xl dark:bg-violet-500/8" />
        <div className="absolute -right-10 -bottom-24 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl dark:bg-emerald-500/6" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 overflow-hidden mask-[linear-gradient(to_bottom,black_40%,transparent)]"
      >
        <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-brand-200/55 blur-3xl dark:bg-brand-500/15" />
        <div className="absolute top-6 -right-24 h-72 w-72 rounded-full bg-pink-200/45 blur-3xl dark:bg-pink-500/10" />
        <div className="absolute top-40 left-1/4 h-64 w-64 rounded-full bg-amber-100/60 blur-3xl dark:bg-amber-500/8" />
      </div>
    </>
  );
}
