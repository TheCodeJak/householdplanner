import { FilledCheck, ICON_SIZE, TaskStatus } from "../dashboard/TaskCard";

export function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === "completed") return <FilledCheck className="text-green-600" />;
  if (status === "claimed") return <FilledCheck className="text-orange-500" />;
  return (
    <span
      className="block rounded-full border border-slate-300"
      style={{ width: ICON_SIZE, height: ICON_SIZE }}
    />
  );
}
