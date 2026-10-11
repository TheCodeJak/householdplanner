"use client";

import { StatusMessage } from "@/components/ui/StatusMessage";
import { Button } from "jaklib/core";

/**
 * Fehlergrenze (Error Boundary) für alle Seiten nach dem Login: Next.js zeigt
 * diese Datei statt der Seite, wenn beim Rendern etwas Unerwartetes kaputtgeht.
 * Layout und Bottom-Navigation bleiben stehen, man kann also weiter navigieren.
 * `reset` versucht, die Seite neu zu rendern.
 */
export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <StatusMessage
      kind="server"
      title="Da ist etwas schiefgelaufen"
      text="Diese Seite konnte nicht geladen werden. Versuch es noch einmal."
      action={<Button onClick={reset}>Erneut versuchen</Button>}
    />
  );
}
