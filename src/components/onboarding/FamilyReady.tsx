"use client";

import { InviteCodeCard } from "@/components/ui/InviteCodeCard";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import type { Person } from "@/types/plan";
import { Button } from "jaklib/core";
import { useRouter } from "next/navigation";

/**
 * Inhalt des letzten Schritts: Nach dem Gründen steht hier der Code zum
 * Weitergeben, nach dem Beitreten sieht man, wer schon dabei ist. Darunter
 * der Weg ins Dashboard.
 */
export function FamilyReady({
  familyName,
  inviteCode,
  members,
}: {
  familyName: string;
  /** Nur nach dem Gründen: der Code für die anderen */
  inviteCode?: string;
  /** Nur nach dem Beitreten: die Mitglieder der Familie */
  members?: Person[];
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      {inviteCode && (
        <InviteCodeCard code={inviteCode} familyName={familyName} showHint />
      )}
      {members && <MemberRow members={members} />}

      <Button className="w-full" onClick={() => router.push("/dashboard")}>
        Zum Dashboard
      </Button>
    </div>
  );
}

/** Wer schon in der Familie ist, als Kreise mit Namen */
function MemberRow({ members }: { members: Person[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 rounded-2xl bg-surface-2/70 px-4 py-4 dark:bg-black/20">
      {members.map((m) => (
        <div key={m.id} className="flex w-14 flex-col items-center gap-1.5">
          <PersonAvatar person={m} size={48} className="ring-2 ring-surface" />
          <span className="w-full truncate text-center text-caption font-medium text-fg-2">
            {m.isCurrentUser ? "Du" : m.name}
          </span>
        </div>
      ))}
    </div>
  );
}
