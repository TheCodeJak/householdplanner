export type Cell = {
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
} | null;

export type Row = { id: string; name: string; cells: Cell[] };
