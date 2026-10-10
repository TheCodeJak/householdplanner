export function AvatarDot({
  name,
  color,
  completed,
  size = "md",
}: {
  name: string;
  color: string;
  completed: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dimBySize = {
    sm: "h-5 w-5 text-[9px]",
    md: "h-6 w-6 text-[10px]",
    lg: "h-11 w-11 text-sm",
  };
  const dim = dimBySize[size];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold text-white ring-1 ring-surface ${dim}`}
      style={{ backgroundColor: completed ? "#22c55e" : color }}
    >
      {name[0]}
    </span>
  );
}
