import { Card } from "jaklib/core";

export type TaskStatus = "open" | "claimed" | "completed";

type Person = { name: string; color: string };

// type TaskWrapperProps = {
//   title: string;
//   status: TaskStatus;
//   assignee?: Person;
//   completedBy?: Person;
// };

type Slot = {
  status: TaskStatus;
  assignee?: Person;
  completedBy?: Person;
  slotTitle?: string;
};

interface TaskWrapperProps {
  title: string;
  slots: Slot[];
}

const ICON_SIZE = 28;

function FilledCheck({ className }: { className: string }) {
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

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === "completed") return <FilledCheck className="text-green-600" />;
  if (status === "claimed") return <FilledCheck className="text-orange-500" />;
  return (
    <span
      className="block rounded-full border border-slate-300"
      style={{ width: ICON_SIZE, height: ICON_SIZE }}
    />
  );
}

function PersonDot({ name, color }: Person) {
  return (
    <span
      className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {name[0].toUpperCase()}
    </span>
  );
}

export function TaskCard({ title, slots }: TaskWrapperProps) {
  const isOneSlot = slots.length == 1;
  const { status, assignee, completedBy } = slots[0];

  return (
    <Card variant="panel" className="min-h-0 overflow-hidden">
      <div className="flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="shrink-0">
            <StatusIcon status={status} />
          </span>

          <span className="line-clamp-2 min-w-0 flex-1 text-xs font-semibold text-slate-800">
            {title}
          </span>

          {isOneSlot && assignee && (
            <div className="flex shrink-0 items-center gap-1.5">
              <PersonDot {...assignee} />
              {completedBy && (
                <>
                  <span className="text-xs font-bold text-slate-400">→</span>
                  <PersonDot {...completedBy} />
                </>
              )}
            </div>
          )}
        </div>

        {!isOneSlot && (
          <Card variant="panel" className="min-h-0 mx-2 mb-2 p-2 rounded-xl">
            <span className="flex flex-col gap-y-2">
              {slots.map((slot) => (
                <div
                  key={slot.slotTitle}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="shrink-0">
                    <StatusIcon status={slot.status} />
                  </span>

                  <span className="line-clamp-2 min-w-0 flex-1 text-xs font-semibold text-slate-800">
                    {slot.slotTitle}
                  </span>
                  {slot.assignee && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <PersonDot {...slot.assignee} />
                      {slot.completedBy && (
                        <>
                          <span className="text-xs font-bold text-slate-400">
                            →
                          </span>
                          <PersonDot {...slot.completedBy} />
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </span>
          </Card>
        )}
      </div>
    </Card>
  );
}
