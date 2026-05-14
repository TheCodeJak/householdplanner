"use client";

import { AvatarDot } from "./avatarDot";
import Modal from "./modal";
import { CloseButton } from "../icons/close";
import { Button } from "./button";

const DAY_DE = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];

export type CellModalProps = {
  taskName: string;
  cell: {
    assignmentId?: string | null;
    assigneeName?: string | null;
    assigneeColor?: string | null;
    isCompleted: boolean;
    isCurrentUser?: boolean;
    completedByName?: string | null;
    completedByColor?: string | null;
    isCompletedByCurrentUser?: boolean;
    note?: string | null;
  } | null;
  weekDay: Date;
  onClose: () => void;
  onAssign?: () => void;
  onUnassign?: () => void;
  onComplete?: () => void;
  onUncomplete?: () => void;
};

export default function CellModal({
  taskName,
  cell,
  weekDay,
  onClose,
  onAssign,
  onUnassign,
  onComplete,
  onUncomplete,
}: CellModalProps) {
  const deIdx = weekDay.getDay() === 0 ? 6 : weekDay.getDay() - 1;
  const dayLabel = `${DAY_DE[deIdx]}, ${weekDay.getDate()}.${weekDay.getMonth() + 1}.`;

  const hasAssignee = !!cell?.assigneeName;
  const isCompleted = cell?.isCompleted ?? false;
  const isCurrentUser = cell?.isCurrentUser ?? false;
  const isCompletedByCurrentUser = cell?.isCompletedByCurrentUser ?? false;
  const completedByName = cell?.completedByName ?? null;
  const completerDiffers =
    isCompleted && !!completedByName && completedByName !== cell?.assigneeName;

  return (
    <Modal onClose={onClose}>
      {(close) => (
        <>
          <div className="mb-5 flex items-start justify-between">
            <div>
              <span className="text-lg font-semibold text-slate-800">
                {taskName}
              </span>
              <p className="mt-0.5 text-sm text-slate-500">{dayLabel}</p>
            </div>
            <CloseButton onClose={close} />
          </div>

          <Section label="Geplant von">
            {hasAssignee ? (
              <div className="flex items-center gap-3">
                <AvatarDot
                  name={cell!.assigneeName!}
                  color={cell!.assigneeColor ?? "#94a3b8"}
                  completed={false}
                />
                <span className="text-sm font-medium text-slate-700">
                  {isCurrentUser ? "Du" : cell!.assigneeName}
                </span>
              </div>
            ) : (
              <p className="text-sm italic text-slate-400">
                Noch niemand eingeteilt.
              </p>
            )}
          </Section>

          {isCompleted && (
            <Section label="Erledigt von">
              <div className="flex items-center gap-3">
                <AvatarDot
                  name={completedByName ?? cell!.assigneeName!}
                  color={
                    cell?.completedByColor ?? cell?.assigneeColor ?? "#22c55e"
                  }
                  completed={true}
                />
                <span className="text-sm font-medium text-slate-700">
                  {isCompletedByCurrentUser
                    ? "Du"
                    : (completedByName ?? cell!.assigneeName)}
                  {completerDiffers && (
                    <span className="ml-1 text-xs text-slate-400">
                      (statt {cell!.assigneeName})
                    </span>
                  )}
                </span>
                <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-green-600">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Erledigt
                </span>
              </div>
            </Section>
          )}

          {cell?.note && (
            <Section label="Notiz">
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                {cell.note}
              </div>
            </Section>
          )}

          <div className="flex flex-col gap-2">
            {!hasAssignee && (
              <Button
                variant="primary"
                size="lg"
                onClick={onAssign}
                className="w-full"
              >
                Ich mache das
              </Button>
            )}

            {hasAssignee && !isCompleted && (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onComplete}
                  className="w-full"
                >
                  {isCurrentUser
                    ? "Als erledigt markieren"
                    : "Ich habe das erledigt"}
                </Button>
                {isCurrentUser && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={onUnassign}
                    className="w-full"
                  >
                    Nicht mehr ich
                  </Button>
                )}
              </>
            )}

            {isCompleted && isCompletedByCurrentUser && (
              <Button
                variant="ghost"
                size="lg"
                onClick={onUncomplete}
                className="w-full"
              >
                Doch nicht erledigt
              </Button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      {children}
    </div>
  );
}
