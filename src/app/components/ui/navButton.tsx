export default function NavButton({
  onClick,
  dir,
}: {
  onClick: () => void;
  dir: "left" | "right";
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        {dir === "left" ? (
          <path
            d="M8.5 2L3.5 6.5l5 4.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M4.5 2l5 4.5-5 4.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}
