"use server";

import {
  createFamily,
  getFamilyMembers,
  joinFamily,
} from "@/db/queries/family";
import { auth, unstable_update } from "@/lib/auth";
import { familyNameSchema } from "@/lib/familySchemas";
import { INVITE_CODE_LENGTH, parseInviteCode } from "@/lib/inviteCode";
import { getClientIp, isRateLimited, RATE_LIMITS } from "@/lib/rateLimit";
import type { FamilyActionResult } from "@/types/profile";
import { headers } from "next/headers";

// Familie gründen und beitreten. Beides läuft als Server Action, weil danach
// das Login-Token aktualisiert werden muss (unstable_update setzt das Cookie
// nur hier zuverlässig). Die Texte der Fehler sind für den Nutzer gedacht.

const SESSION_EXPIRED: FamilyActionResult = {
  ok: false,
  error: "Deine Anmeldung ist abgelaufen. Bitte melde dich neu an.",
};
const TOO_MANY: FamilyActionResult = {
  ok: false,
  error:
    "Zu viele Versuche. Bitte warte ein paar Minuten und probiere es dann noch einmal.",
};
const ALREADY_IN_FAMILY: FamilyActionResult = {
  ok: false,
  error: "Du gehörst bereits zu einer Familie.",
};

/** Die angemeldete Nutzer-ID, die Identität kommt nie vom Browser */
async function currentUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

/**
 * Die Familie im Login-Token auffrischen. Was mitgeschickt wird, ist egal:
 * Der jwt-Callback liest die Familie selbst aus der Datenbank (lib/auth.ts).
 */
async function refreshSession() {
  await unstable_update({ user: {} });
}

export async function createFamilyAction(
  name: string,
): Promise<FamilyActionResult> {
  const userId = await currentUserId();
  if (!userId) return SESSION_EXPIRED;

  if (
    await isRateLimited(
      `family-create:user:${userId}`,
      RATE_LIMITS.familyCreateUser,
    )
  ) {
    return TOO_MANY;
  }

  const parsed = familyNameSchema.safeParse(name);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const created = await createFamily({ userId, name: parsed.data });
  if (!created) return ALREADY_IN_FAMILY;

  await refreshSession();
  return {
    ok: true,
    familyName: created.name,
    inviteCode: created.inviteCode,
    members: await getFamilyMembers({
      familyId: created.familyId,
      currentUserId: userId,
    }),
  };
}

export async function joinFamilyAction(
  rawCode: string,
): Promise<FamilyActionResult> {
  const userId = await currentUserId();
  if (!userId) return SESSION_EXPIRED;

  // Der Code ist das einzige Geheimnis: Versuche pro Nutzer UND pro IP zählen
  const ip = getClientIp(await headers());
  if (
    (await isRateLimited(
      `family-join:user:${userId}`,
      RATE_LIMITS.familyJoinUser,
    )) ||
    (await isRateLimited(`family-join:ip:${ip}`, RATE_LIMITS.familyJoinIp))
  ) {
    return TOO_MANY;
  }

  const code = parseInviteCode(String(rawCode));
  const result =
    code.length === INVITE_CODE_LENGTH
      ? await joinFamily({ userId, code })
      : ({ ok: false, reason: "unknown_code" } as const);

  if (!result.ok) {
    if (result.reason === "already_in_family") return ALREADY_IN_FAMILY;
    if (result.reason === "no_user") return SESSION_EXPIRED;
    return {
      ok: false,
      error:
        "Dieser Code passt zu keiner Familie. Prüfe ihn und versuche es noch einmal.",
    };
  }

  await refreshSession();
  return {
    ok: true,
    familyName: result.name,
    members: await getFamilyMembers({
      familyId: result.familyId,
      currentUserId: userId,
    }),
  };
}
