import type { TaskView } from "@/types/plan";
import { TaskCard } from "./TaskCard";

export function TaskCardList({
  tasks,
  onSelect,
}: {
  tasks: TaskView[];
  onSelect: (taskId: string, slotId: string | null) => void;
}) {
  if (tasks.length === 0) {
    return (
      <p className="m-2 text-center text-sm text-subtle">
        Keine Aufgaben vorhanden.
      </p>
    );
  }

  return (
    <div className="m-2 flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.taskId}
          taskView={task}
          onSelect={(slotId) => onSelect(task.taskId, slotId)}
        />
      ))}
    </div>
  );
}
