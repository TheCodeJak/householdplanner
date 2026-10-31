import { personColor } from "@/lib/color";
import type { Person } from "@/types/plan";
import { useSession } from "next-auth/react";

/**
 * Der angemeldete Nutzer als Person, mit seiner Farbe. Sie kommt aus dem
 * Anmelde-Token und ist dieselbe wie in den Daten des Servers, daher steht sie
 * auf jeder Seite sofort bereit, ohne Abfrage. Null, solange die Sitzung lädt.
 */
export function useMe(): Person | null {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user?.id) return null;
  return {
    id: user.id,
    name: user.name ?? "",
    color: user.color ?? personColor(0),
    isCurrentUser: true,
  };
}
