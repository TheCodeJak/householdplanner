"use client";

import { TaskListSkeleton } from "@/components/ui/TaskListSkeleton";
import { InviteModal } from "@/components/modals/InviteModal";
import { MemberModal } from "@/components/modals/MemberModal";
import { TaskEditModal } from "@/components/modals/TaskEditModal";
import { AccountSection } from "@/components/profile/AccountSection";
import { MemberCircles } from "@/components/profile/MemberCircles";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileTasks } from "@/components/profile/ProfileTasks";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useFamily, useRegenerateInviteCode } from "@/hooks/useFamily";
import { useModalTarget } from "@/hooks/useModalTarget";
import {
  useTaskTemplateActions,
  useTaskTemplates,
} from "@/hooks/useTaskTemplates";
import { DEFAULT_CATEGORY } from "@/lib/categories";
import { colorFromUserId } from "@/lib/color";
import { describeError } from "@/lib/describeError";
import type { FamilyMember, TaskTemplate } from "@/types/profile";
import { useSession } from "next-auth/react";
import { useState } from "react";

// Die Seite setzt nur Daten und Komponenten zusammen: Familie und Mitglieder
// (useFamily) und die Aufgaben (useTaskTemplates) kommen vom Server.
export default function ProfilePage() {
  const {
    family,
    isLoading: familyLoading,
    error: familyError,
    refetch: refetchFamily,
  } = useFamily();
  const regenerate = useRegenerateInviteCode();
  const { data: session } = useSession();

  // Der angemeldete Nutzer. Fällt die Familien-Abfrage aus, bauen wir ihn aus
  // der Sitzung, damit Konto und "Abmelden" trotzdem da sind.
  const me: FamilyMember | null =
    family?.members.find((m) => m.isCurrentUser) ??
    (session?.user?.id
      ? {
          id: session.user.id,
          name: session.user.name ?? "",
          email: session.user.email ?? "",
          color: colorFromUserId(session.user.id),
          isCurrentUser: true,
          isAdmin: false,
        }
      : null);

  const { tasks, isLoading, error, hasData, refetch } = useTaskTemplates();
  const actions = useTaskTemplateActions();
  const activeTasks = tasks.filter((t) => t.isActive);
  const archivedTasks = tasks.filter((t) => !t.isActive);
  // Vorhandene Kategorien; "Sonstiges" steht immer zur Wahl
  const categories = [
    ...new Set([...tasks.map((t) => t.category), DEFAULT_CATEGORY]),
  ];

  // { task: null } = neue Aufgabe. Das Objekt drumherum, damit "null" ein
  // gültiges Ziel ist und useModalTarget es von "kein Ziel" unterscheidet.
  const taskModal = useModalTarget<{ task: TaskTemplate | null }>();
  // Zählt die Öffnungen: Das Sheet bleibt nach dem Schließen eingehängt, ohne
  // neuen key würde es beim erneuten Öffnen den alten, verworfenen Stand zeigen.
  const [editSession, setEditSession] = useState(0);
  const memberModal = useModalTarget<FamilyMember>();
  const inviteModal = useModalTarget<true>();

  function openTask(task: TaskTemplate | null) {
    actions.reset();
    setEditSession((n) => n + 1);
    taskModal.openFor({ task });
  }

  return (
    <>
      {/* surface-soft: deckende Flächen statt Milchglas (globals.css) */}
      <div className="surface-soft px-4 pt-[max(2.5rem,env(safe-area-inset-top))] pb-6">
        {family && me ? (
          <>
            <ProfileHero
              person={me}
              familyName={family.name}
              stats={[
                { value: family.members.length, label: "Mitglieder" },
                { value: activeTasks.length, label: "Aufgaben" },
                { value: family.doneThisWeek, label: "diese Woche" },
              ]}
            />

            <SectionLabel>Familie · {family.members.length}</SectionLabel>
            <MemberCircles
              members={family.members}
              onSelect={memberModal.openFor}
              onInvite={() => {
                regenerate.reset();
                inviteModal.openFor(true);
              }}
            />
          </>
        ) : familyError ? (
          <InlineAlert
            text={describeError(familyError).text}
            actionLabel="Erneut versuchen"
            onAction={() => refetchFamily()}
          />
        ) : (
          familyLoading && <FamilySkeleton />
        )}

        {isLoading ? (
          <>
            <SectionLabel>Aufgaben</SectionLabel>
            <TaskListSkeleton />
          </>
        ) : error && !hasData ? (
          <>
            <SectionLabel>Aufgaben</SectionLabel>
            <InlineAlert
              text={describeError(error).text}
              actionLabel="Erneut versuchen"
              onAction={() => refetch()}
            />
          </>
        ) : (
          <ProfileTasks
            tasks={activeTasks}
            archived={archivedTasks}
            onEdit={openTask}
            onRestore={actions.restore}
          />
        )}
        {/* Fehler beim Zurückholen (das Sheet zeigt seine Fehler selbst) */}
        {actions.error && !taskModal.isOpen && (
          <div className="mt-2">
            <InlineAlert text={describeError(actions.error).text} />
          </div>
        )}

        {me && <AccountSection person={me} />}
      </div>

      {taskModal.target && (
        <TaskEditModal
          // key: bei anderer Aufgabe oder neuer Öffnung das Formular frisch vorbelegen
          key={`${taskModal.target.task?.id ?? "new"}-${editSession}`}
          open={taskModal.isOpen}
          onClose={taskModal.close}
          task={taskModal.target.task}
          categories={categories}
          onSave={(draft) =>
            actions.save(taskModal.target!.task, draft, taskModal.close)
          }
          onArchive={() => {
            const task = taskModal.target!.task;
            if (task) actions.archive(task, taskModal.close);
          }}
          isPending={actions.isPending}
          errorText={actions.error ? describeError(actions.error).text : null}
        />
      )}
      {memberModal.target && (
        <MemberModal
          open={memberModal.isOpen}
          onClose={memberModal.close}
          member={memberModal.target}
        />
      )}
      {inviteModal.target && family && (
        <InviteModal
          open={inviteModal.isOpen}
          onClose={inviteModal.close}
          familyName={family.name}
          inviteCode={family.inviteCode}
          canRegenerate={Boolean(me?.isAdmin)}
          onRegenerate={regenerate.regenerate}
          isPending={regenerate.isPending}
          errorText={
            regenerate.error ? describeError(regenerate.error).text : null
          }
        />
      )}
    </>
  );
}

/** Platzhalter für Kopf und Mitglieder, solange die Familie lädt */
function FamilySkeleton() {
  return (
    <div role="status" className="motion-safe:animate-pulse" aria-hidden>
      <span className="sr-only">Familie wird geladen</span>
      <div className="mx-auto h-22 w-22 rounded-full bg-surface-2" />
      <div className="mx-auto mt-4 h-5 w-32 rounded-full bg-surface-2" />
      <div className="mx-auto mt-2 h-3 w-44 rounded-full bg-surface-2" />
      <div className="mt-6 h-16 rounded-2xl bg-surface-2" />
    </div>
  );
}
