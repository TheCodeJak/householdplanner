// Wer darf wohin? Reine Entscheidung ohne Next.js, damit sie sich testen lässt
// (src/proxy.ts ruft sie nur auf).

const PROTECTED = ["/dashboard", "/calendar", "/statistics", "/profile"];

const startsWithPath = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(base + "/");

/**
 * Gibt das Ziel einer Umleitung zurück oder null, wenn die Seite erlaubt ist.
 *
 * - nicht angemeldet: geschützte Seiten und Onboarding → Login
 * - angemeldet, ohne Familie: Startseite, Login, Registrierung und alle
 *   geschützten Seiten → Onboarding
 * - angemeldet, mit Familie: Startseite, Login, Registrierung und Onboarding
 *   → Dashboard
 *
 * `hasFamily` kommt aus dem Login-Token. Dort steht die Familie bis zur
 * nächsten Aktualisierung (siehe lib/auth.ts). Wer eine Familie verlässt,
 * muss das Token deshalb mit aktualisieren, sonst schickt ihn dieser Schutz
 * im Kreis zwischen Dashboard und Onboarding.
 */
export function guardRedirect({
  pathname,
  isLoggedIn,
  hasFamily,
}: {
  pathname: string;
  isLoggedIn: boolean;
  hasFamily: boolean;
}): string | null {
  const isProtected = PROTECTED.some((p) => startsWithPath(pathname, p));
  const isOnboarding = startsWithPath(pathname, "/onboarding");
  const isEntry =
    pathname === "/" || pathname === "/login" || pathname === "/register";

  if (!isLoggedIn) return isProtected || isOnboarding ? "/login" : null;

  if (isEntry) return hasFamily ? "/dashboard" : "/onboarding";
  if (isProtected && !hasFamily) return "/onboarding";
  if (isOnboarding && hasFamily) return "/dashboard";
  return null;
}
