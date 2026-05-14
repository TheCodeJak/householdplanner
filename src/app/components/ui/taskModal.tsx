"use client";

import Modal from "../layout/modal";
import { CloseButton } from "../icons/closeButton";
import { Button } from "./button";
import { Input } from "./input";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { FAMILY_ID } from "@/app/(dashboard)/page";

type TaskModalProps = {
  onClose: () => void;
};

export default function TaskModal({ onClose }: TaskModalProps) {
  const [title, setTitle] = useState<string>("");

  const utils = trpc.useUtils();

  const addTaskMutation = trpc.tasks.add.useMutation({
    onSuccess: () => utils.tasks.getByFamily.invalidate(),
  });

  return (
    <Modal onClose={onClose} size="standard">
      {(close) => (
        <>
          <div className="mb-5 flex items-start justify-between">
            <div>
              <span className="text-lg font-semibold text-slate-800">
                Neue Aufgabe
              </span>
              <p className="mt-0.5 text-sm text-slate-500">
                Aufgabe für den Haushaltsplan erstellen
              </p>
            </div>
            <CloseButton onClose={close} />
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="Titel"
              value={title}
              placeholder="z.B. Staubsaugen"
              onChange={(e) => setTitle(e.target.value)}
              onBlur={(e) => setTitle(e.target.value)}
            />

            <Button
              size="lg"
              className="mt-2 w-full"
              onClick={() => {
                addTaskMutation.mutate({
                  title: title,
                  familyId: FAMILY_ID,
                });
              }}
            >
              Aufgabe erstellen
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
