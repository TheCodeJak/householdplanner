"use client";

import { useEffect, useRef, useState } from "react";
import { AvatarDot } from "./avatarDot";

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
    note?: string | null;
  } | null;
  weekDay: Date;
  onClose: () => void;
  onAssign?: () => void;
  onUnassign?: () => void;
};

export default function CellModal({
  taskName,
  cell,
  weekDay,
  onClose,
  onAssign,
  onUnassign,
}: CellModalProps) {
  const [visible, setVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  const deIdx = weekDay.getDay() === 0 ? 6 : weekDay.getDay() - 1;
  const dayLabel = `${DAY_DE[deIdx]}, ${weekDay.getDate()}.${weekDay.getMonth() + 1}.`;

  const hasAssignee = !!cell?.assigneeName;
  const isCompleted = cell?.isCompleted ?? false;
  const isCurrentUser = cell?.isCurrentUser ?? false;

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragOffset(Math.max(0, e.clientY - startY.current));
  };

  const onPointerUp = () => {
    setDragging(false);
    if (dragOffset > 110) close();
    else setDragOffset(0);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      />

      {/* Sheet */}
      <div
        style={{
          transform: visible
            ? `translateY(${dragOffset}px)`
            : "translateY(100%)",
        }}
        className={`fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-xl rounded-t-3xl bg-white shadow-2xl ${dragging ? "" : "transition-transform duration-300 ease-out"}`}
      >
        {/* Drag handle */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="flex touch-none select-none justify-center pb-2 pt-3 cursor-grab active:cursor-grabbing"
        >
          <div className="h-1 w-10 rounded-full bg-slate-300" />
        </div>

        {/* Content */}
        <div className="max-h-[78vh] overflow-y-auto overscroll-contain px-6 pb-10 pt-2">
          {/* Titel */}
          <div className="mb-5 flex items-start justify-between">
            <div>
              <span className="text-lg font-semibold text-slate-800">
                {taskName}
              </span>
              <p className="mt-0.5 text-sm text-slate-500">{dayLabel}</p>
            </div>
            <button
              onClick={close}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M2 2l9 9M11 2L2 11"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Zugewiesen an */}
          <Section label="Zugewiesen an">
            {hasAssignee ? (
              <div className="flex items-center gap-3">
                <AvatarDot
                  name={cell!.assigneeName!}
                  color={cell!.assigneeColor ?? "#94a3b8"}
                  completed={isCompleted}
                />
                <span className="text-sm font-medium text-slate-700">
                  {isCurrentUser ? "Du" : cell!.assigneeName}
                </span>
                {isCompleted && (
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
                )}
              </div>
            ) : (
              <p className="text-sm italic text-slate-400">
                Noch niemand eingeteilt.
              </p>
            )}
          </Section>

          {/* Notiz */}
          {cell?.note && (
            <Section label="Notiz">
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                {cell.note}
              </div>
            </Section>
          )}

          {/* Aktionen */}
          <div className="flex flex-col gap-2">
            {isCurrentUser ? (
              <button
                onClick={() => { onUnassign?.(); close(); }}
                className="w-full cursor-pointer rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 active:scale-[.98]"
              >
                Nicht mehr ich
              </button>
            ) : (
              <button
                onClick={() => { onAssign?.(); close(); }}
                className="w-full cursor-pointer rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[.98]"
              >
                Ich mache das
              </button>
            )}
          </div>
        </div>
      </div>
    </>
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
