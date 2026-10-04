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

type TaskStatus = "open" | "claimed" | "completed";

type Person = {
  id: string;
  name: string;
  color: string;
  isCurrentUser: boolean;
};

type SlotView = {
  slotId: string | null; // null = Aufgabe ohne Zeitslot
  label: string | null; // "Morgens" ...
  status: TaskStatus;
  assignmentId: string | null;
  assignee: Person | null;
  completedBy: Person | null; // nur gesetzt, wenn abweichend vom Assignee
  note: string | null;
};

type TaskView = { taskId: string; title: string; slots: SlotView[] };

type SlotRef = { taskId: string; slotId: string | null; date: string }; // ISO-Datum
