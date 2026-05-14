export function AvatarDot({
  name,
  color,
  completed,
  size = "md",
}: {
  name: string;
  color: string;
  completed: boolean;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[10px]";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold text-white ring-1 ring-white ${dim}`}
      style={{ backgroundColor: completed ? "#22c55e" : color }}
    >
      {name[0]}
    </span>
  );
}
