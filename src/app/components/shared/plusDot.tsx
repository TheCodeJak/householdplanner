export function PlusDot({ size = "md" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border border-dashed border-line bg-surface-2 text-subtle ${dim}`}
    >
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
        <path
          d="M4.5 1.5v6M1.5 4.5h6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
