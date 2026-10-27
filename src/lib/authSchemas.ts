import { z } from "zod";

// bcrypt verarbeitet nur die ersten 72 Bytes. Längere Passwörter würden still
// abgeschnitten, deshalb lehnen wir sie ab.
const BCRYPT_MAX_BYTES = 72;

export const MAX_EMAIL_LENGTH = 254;
export const MAX_LOGIN_PASSWORD_LENGTH = 1024;

/** E-Mails werden überall klein geschrieben, damit A@x.de und a@x.de dasselbe Konto sind. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Bitte gib deinen Namen ein.")
    .max(80, "Der Name ist zu lang."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(MAX_EMAIL_LENGTH, "Die E-Mail-Adresse ist zu lang.")
    .pipe(z.email("Bitte gib eine gültige E-Mail-Adresse ein.")),
  password: z
    .string()
    .min(10, "Das Passwort muss mindestens 10 Zeichen lang sein.")
    .refine(
      (p) => Buffer.byteLength(p, "utf8") <= BCRYPT_MAX_BYTES,
      "Das Passwort ist zu lang (höchstens 72 Zeichen, Umlaute zählen doppelt).",
    ),
});
