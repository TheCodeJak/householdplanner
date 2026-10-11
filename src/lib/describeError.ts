// Übersetzt einen Fehler aus einer tRPC-Anfrage in eine verständliche Meldung.
// Reine Funktion: gleiche Eingabe → gleiche Ausgabe, kein React.

export type ErrorKind =
  "offline" | "server" | "session" | "family" | "conflict";

export type ErrorInfo = {
  kind: ErrorKind;
  title: string;
  text: string;
};

// Minimaler Ausschnitt eines tRPC-Client-Fehlers. Bewusst so schmal, damit
// die Funktion nicht vom konkreten Router-Typ abhängt.
type ClientError = {
  message: string;
  // `data` fehlt, wenn die Antwort gar nicht vom Server kam (Netzwerkfehler)
  data?: { code?: string } | null;
};

// Diese Meldungen schreiben wir im Router selbst (z.B. "Diese Aufgabe ist
// bereits vergeben.") – sie sind für Nutzer gedacht und dürfen angezeigt werden.
const USER_FACING_CODES = ["CONFLICT", "NOT_FOUND", "BAD_REQUEST"];

export function describeError(error: ClientError): ErrorInfo {
  const code = error.data?.code;

  // Keine Antwort vom Server: kein Internet, Server aus oder nicht erreichbar.
  // Der Browser liefert dann je nach Hersteller "Failed to fetch",
  // "NetworkError …" oder "Load failed" – gemeinsam ist: `data` fehlt.
  if (!code) {
    const offline = typeof navigator !== "undefined" && !navigator.onLine;
    return {
      kind: "offline",
      title: offline ? "Keine Internetverbindung" : "Server nicht erreichbar",
      text: offline
        ? "Prüfe dein WLAN oder deine mobilen Daten und versuch es dann noch einmal."
        : "Der Server antwortet gerade nicht. Versuch es gleich noch einmal.",
    };
  }

  if (code === "UNAUTHORIZED") {
    return {
      kind: "session",
      title: "Bitte neu anmelden",
      text: "Deine Anmeldung ist abgelaufen.",
    };
  }

  if (code === "FORBIDDEN") {
    return {
      kind: "family",
      title: "Noch keine Familie",
      text: "Dein Konto gehört noch zu keiner Familie. Tritt einer bei oder gründe eine eigene.",
    };
  }

  if (USER_FACING_CODES.includes(code)) {
    return {
      kind: "conflict",
      title: "Das hat nicht geklappt",
      text: error.message,
    };
  }

  // INTERNAL_SERVER_ERROR u.a. – z.B. wenn die Datenbank nicht erreichbar ist.
  // Die rohe Meldung zeigen wir nicht: Sie kann technische Details enthalten.
  return {
    kind: "server",
    title: "Da ist etwas schiefgelaufen",
    text: "Der Server hat gerade ein Problem. Deine Daten sind sicher – versuch es gleich noch einmal.",
  };
}
