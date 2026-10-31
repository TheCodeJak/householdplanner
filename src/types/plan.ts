import type { TaskIconName } from "@/lib/taskIcons";

// Der Vertrag zwischen Server und Browser: plan.getDay liefert TaskView[],
// die Oberfläche rendert nur noch diese fertigen Objekte.

// open = keine Zuweisung, claimed = übernommen, completed = erledigt
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
  category: string; // Gruppe im Dashboard; ohne Angabe "Sonstiges"
  slots: SlotView[];
};

export type SlotRef = { taskId: string; slotId: string | null; date: string }; // ISO-Datum
