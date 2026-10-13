"use client";

import { InviteModal } from "@/components/modals/InviteModal";
import { MemberModal } from "@/components/modals/MemberModal";
import { TaskEditModal } from "@/components/modals/TaskEditModal";
import { AccountSection } from "@/components/profile/AccountSection";
import { MemberCircles } from "@/components/profile/MemberCircles";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileTasks } from "@/components/profile/ProfileTasks";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useModalTarget } from "@/hooks/useModalTarget";
import {
  MOCK_DONE_THIS_WEEK,
  MOCK_FAMILY,
  MOCK_MEMBERS,
  MOCK_TASKS,
} from "@/lib/profileMock";
import type { FamilyMember, TaskTemplate } from "@/types/profile";

// Die Seite setzt nur Daten und Komponenten zusammen.
// ⚠️ Noch mit Beispieldaten (lib/profileMock.ts) – beim Anbinden hier durch
// Hooks ersetzen (z.B. useFamily(), useTaskTemplates()).
const me = MOCK_MEMBERS.find((m) => m.isCurrentUser)!;
const activeTasks = MOCK_TASKS.filter((t) => t.isActive);
const archivedTasks = MOCK_TASKS.filter((t) => !t.isActive);
const categories = [...new Set(MOCK_TASKS.map((t) => t.category))];

export default function ProfilePage() {
  // { task: null } = neue Aufgabe. Das Objekt drumherum, damit "null" ein
  // gültiges Ziel ist und useModalTarget es von "kein Ziel" unterscheidet.
  const taskModal = useModalTarget<{ task: TaskTemplate | null }>();
  const memberModal = useModalTarget<FamilyMember>();
  const inviteModal = useModalTarget<true>();

  return (
    <>
      {/* surface-soft: deckende Flächen statt Milchglas (globals.css) */}
      <div className="surface-soft px-4 pt-[max(2.5rem,env(safe-area-inset-top))] pb-6">
        <ProfileHero
          person={me}
          familyName={MOCK_FAMILY.name}
          stats={[
            { value: MOCK_MEMBERS.length, label: "Mitglieder" },
            { value: activeTasks.length, label: "Aufgaben" },
            { value: MOCK_DONE_THIS_WEEK, label: "diese Woche" },
          ]}
        />

        <SectionLabel>Familie · {MOCK_MEMBERS.length}</SectionLabel>
        <MemberCircles
          members={MOCK_MEMBERS}
          onSelect={memberModal.openFor}
          onInvite={() => inviteModal.openFor(true)}
        />

        <ProfileTasks
          tasks={activeTasks}
          archived={archivedTasks}
          onEdit={(task) => taskModal.openFor({ task })}
          onRestore={() => {}}
        />

        <AccountSection person={me} />
      </div>

      {taskModal.target && (
        <TaskEditModal
          // key: bei anderer Aufgabe das Formular frisch vorbelegen
          key={taskModal.target.task?.id ?? "new"}
          open={taskModal.isOpen}
          onClose={taskModal.close}
          task={taskModal.target.task}
          categories={categories}
        />
      )}
      {memberModal.target && (
        <MemberModal
          open={memberModal.isOpen}
          onClose={memberModal.close}
          member={memberModal.target}
        />
      )}
      {inviteModal.target && (
        <InviteModal
          open={inviteModal.isOpen}
          onClose={inviteModal.close}
          familyName={MOCK_FAMILY.name}
          inviteCode={MOCK_FAMILY.inviteCode}
        />
      )}
    </>
  );
}
