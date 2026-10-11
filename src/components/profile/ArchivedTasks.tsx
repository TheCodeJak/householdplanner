"use client";

import { Glyph } from "@/components/icons";
import { TaskTile } from "@/components/ui/TaskTile";
import type { TaskTemplate } from "@/types/profile";
import { useState } from "react";

/** "Archiviert (2)" zum Aufklappen, je Aufgabe ein "Zurückholen" */
export function ArchivedTasks({
  tasks,
  onRestore,
}: {
  tasks: TaskTemplate[];
  onRestore: (task: TaskTemplate) => void;
}) {
  const [open, setOpen] = useState(false);
  if (tasks.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-1 py-2 text-xs font-semibold text-subtle"
      >
        <Glyph
          name="chevron"
          size={12}
          className={`transition-transform ${open ? "rotate-90" : ""}`}
        />
        Archiviert ({tasks.length})
      </button>
      {open && (
        <div className="flex flex-col gap-1 px-1">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-xl px-1 py-1.5"
            >
              <span className="opacity-50">
                <TaskTile icon={t.icon} title={t.title} size={30} />
              </span>
              <span className="flex-1 text-xs font-semibold text-subtle line-through">
                {t.title}
              </span>
              <button
                type="button"
                onClick={() => onRestore(t)}
                className="flex items-center gap-1 text-xs font-semibold text-brand-600"
              >
                <Glyph name="restore" size={13} /> Zurückholen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
