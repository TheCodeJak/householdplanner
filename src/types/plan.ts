import type { TaskIconName, TaskIconTone } from "@/lib/taskIcons";

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

/**
 * Kategorie einer Aufgabe (Tabelle `category`). `id` ist null bei der
 * Sammelgruppe "Sonstiges" (Aufgaben ohne Kategorie): Sie ist keine Zeile in
 * der Datenbank und hat eine feste neutrale Farbe.
 */
export type CategoryView = {
  id: string | null;
  name: string;
  tone: TaskIconTone;
  /** Eigenes Icon der Kategorie; null = das der ersten Aufgabe zeigen */
  icon: TaskIconName | null;
};

export type TaskView = {
  taskId: string;
  title: string;
  icon: TaskIconName | null; // null = noch kein Icon gewählt
  category: CategoryView; // Gruppe im Dashboard samt Farbe
  slots: SlotView[];
};

export type SlotRef = { taskId: string; slotId: string | null; date: string }; // ISO-Datum
