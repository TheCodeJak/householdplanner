export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path
          d="M2 2l9 9M11 2L2 11"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
