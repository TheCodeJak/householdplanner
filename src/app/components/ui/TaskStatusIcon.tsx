import type { TaskStatus } from "@/types/plan";

export const ICON_SIZE = 28;

export function FilledCheck({ className }: { className: string }) {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 28 28"
      fill="none"
      className={className}
    >
      <circle cx="14" cy="14" r="14" fill="currentColor" />
      <path
        d="M9 14.2l3.2 3.2 6.8-6.8"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === "completed") return <FilledCheck className="text-green-600" />;
  if (status === "claimed") return <FilledCheck className="text-orange-500" />;
  return (
    <span
      className="block rounded-full border border-line"
      style={{ width: ICON_SIZE, height: ICON_SIZE }}
    />
  );
}
