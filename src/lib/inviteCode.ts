// Einladungscodes: 8 Zeichen aus Buchstaben und Ziffern, angezeigt als
// "K7PM–4XQR" (besser vorzulesen und abzutippen). Reine Funktionen ohne React.

export const INVITE_CODE_LENGTH = 8;

/** Der reine Code aus beliebiger Eingabe, z.B. "k7pm-4xqr " oder mit Leerzeichen eingefügt */
export function parseInviteCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, INVITE_CODE_LENGTH);
}

/** "K7PM4XQR" → "K7PM–4XQR"; unvollständige Codes bekommen den Strich erst ab dem 5. Zeichen */
export function formatInviteCode(code: string): string {
  return code.length > 4 ? `${code.slice(0, 4)}–${code.slice(4)}` : code;
}

/**
 * Zeichen, aus denen neue Codes erzeugt werden: Großbuchstaben und Ziffern,
 * ohne die leicht zu verwechselnden I, O, 0 und 1. Das Eingabefeld akzeptiert
 * trotzdem jeden Buchstaben und jede Ziffer (parseInviteCode).
 */
export const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
