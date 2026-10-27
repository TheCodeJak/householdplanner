import { createHash, timingSafeEqual } from "node:crypto";

const sha256 = (value: string) => createHash("sha256").update(value).digest();

/**
 * Prüft den Beta-Registrierungscode gegen REGISTRATION_CODE.
 * Fail closed: ist die Variable nicht gesetzt, wird nie akzeptiert.
 * Beide Werte werden gehasht, damit die Buffer immer gleich lang sind
 * (timingSafeEqual wirft sonst) und die Codelänge nicht durchsickert.
 */
export function isValidRegistrationCode(input: string): boolean {
  const expected = process.env.REGISTRATION_CODE;
  if (!expected) return false;

  return timingSafeEqual(sha256(input), sha256(expected));
}
