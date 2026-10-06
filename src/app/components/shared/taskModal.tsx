"use client";

import { FAMILY_ID } from "@/app/components/dashboard/useWeekPlan";
import { trpc } from "@/lib/trpc";
import { Button, Modal, TextField } from "jaklib/core";
import { useState } from "react";

type TaskModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function TaskModal({ open, onClose }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotInput, setSlotInput] = useState("");

  const utils = trpc.useUtils();

  const addTaskMutation = trpc.tasks.add.useMutation({
    onSuccess: () => {
      utils.tasks.getByFamily.invalidate();
      onClose();
    },
  });

  function addSlot() {
    const label = slotInput.trim();
    if (!label || slots.includes(label)) return;
    setSlots([...slots, label]);
    setSlotInput("");
  }

  function removeSlot(idx: number) {
    setSlots(slots.filter((_, i) => i !== idx));
  }

  return (
    <Modal open={open} onClose={onClose} variant="sheet" title="Neue Aufgabe">
      <p className="-mt-3 mb-5 text-sm text-slate-500">
        Aufgabe für den Haushaltsplan erstellen
      </p>

      <div className="flex flex-col gap-4">
        <TextField
          label="Titel"
          value={title}
          placeholder="z.B. Hund rausgehen"
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Zeitslots (optional)
          </span>
          <p className="text-xs text-slate-400">
            Für Aufgaben die mehrmals am Tag anfallen
          </p>

          {slots.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {slots.map((slot, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-medium text-orange-700"
                >
                  {slot}
                  <button
                    type="button"
                    onClick={() => removeSlot(i)}
                    className="ml-0.5 text-orange-400 hover:text-orange-600"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M3 3l6 6M9 3l-6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-1">
            <input
              value={slotInput}
              onChange={(e) => setSlotInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSlot();
                }
              }}
              placeholder="z.B. Morgens"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={addSlot}
              disabled={!slotInput.trim()}
            >
              +
            </Button>
          </div>
        </div>

        <Button
          size="lg"
          className="mt-2 w-full"
          disabled={!title.trim()}
          onClick={() => {
            addTaskMutation.mutate({
              title: title.trim(),
              familyId: FAMILY_ID,
              slots: slots.length > 0 ? slots : undefined,
            });
          }}
        >
          Aufgabe erstellen
        </Button>
      </div>
    </Modal>
  );
}
