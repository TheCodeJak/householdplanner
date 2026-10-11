/**
 * Kräftige, weich verschwommene Farbflächen – Hintergrund von Login und
 * Registrierung. Der Eltern-Container braucht `relative overflow-hidden`,
 * der Inhalt darüber `relative`.
 *
 * blur-3xl zeichnet die Kreise stark weich. Das ist teuer zu rendern, daher nur
 * hier auf den Auth-Seiten ohne Scrollen. In der Hauptapp nutzt AppBackdrop
 * stattdessen radiale Verläufe.
 * `bg-brand-300/70` = Farbe brand-300 mit 70 % Deckkraft.
 */
export function GlowBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-brand-300/70 blur-3xl dark:bg-brand-600/30" />
      <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-pink-300/60 blur-3xl dark:bg-pink-600/20" />
      <div className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-amber-200/80 blur-3xl dark:bg-amber-500/15" />
    </div>
  );
}
