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
