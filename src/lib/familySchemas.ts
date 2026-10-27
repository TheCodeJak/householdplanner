import { z } from "zod";

/** Name einer neuen Familie, z.B. "Familie Müller" */
export const familyNameSchema = z
  .string()
  .trim()
  .min(1, "Bitte gib einen Namen für die Familie ein.")
  .max(60, "Der Name ist zu lang (höchstens 60 Zeichen).");
