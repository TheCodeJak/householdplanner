export type AssignmentData = {
  assignmentId: string;
  assigneeName: string;
  assigneeColor: string;
  assignedToId: string;
  isCompleted: boolean;
  isCurrentUser: boolean;
  completedByName: string | null;
  completedByColor: string | null;
  isCompletedByCurrentUser: boolean;
  completerDiffers: boolean;
  note: string | null;
};

export type SlotEntry = {
  slotId: string | null;
  label: string | null;
  data: AssignmentData | null;
};

// Each day cell is an array of slot entries.
// Tasks without slots: [{ slotId: null, label: null, data: ... }]
// Tasks with slots: [{ slotId, label, data }, ...]
export type DayCell = SlotEntry[];

export type Row = {
  id: string;
  name: string;
  cells: DayCell[];
};

import type { TaskIconName } from "@/lib/taskIcons";

//! New Types
// ==========================================================================
export type TaskStatus = "open" | "claimed" | "completed";

export type Person = {
  id: string;
  name: string;
  color: string;
  isCurrentUser: boolean;
};

export type SlotView = {
  slotId: string | null; // null = Aufgabe ohne Zeitslot
  label: string | null; // "Morgens" ...
  status: TaskStatus;
  assignmentId: string | null;
  assignee: Person | null;
  completedBy: Person | null;
  notes: string | null;
};

export type TaskView = {
  taskId: string;
  title: string;
  icon: TaskIconName | null; // null = noch kein Icon gewählt
  slots: SlotView[];
};

export type SlotRef = { taskId: string; slotId: string | null; date: string }; // ISO-Datum
