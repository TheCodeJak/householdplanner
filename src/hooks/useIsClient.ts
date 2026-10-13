import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// false beim Server-Rendern und Hydrieren, danach true.
// Für Inhalte, die von der lokalen Uhrzeit/dem lokalen Datum abhängen: Der
// Server (Docker = UTC) kennt die Zeitzone des Browsers nicht, sonst gibt es
// Hydration-Fehler bzw. kurz nach Mitternacht den falschen Tag.
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
