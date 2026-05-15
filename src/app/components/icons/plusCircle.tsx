import { IconProps } from ".";

export function PlusCircleIcon({ size = 32, className }: IconProps) {
  const r = size / 2;
  const arm = size * 0.2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={className}
    >
      <circle
        cx={r}
        cy={r}
        r={r - 0.5}
        stroke="#CBD5E1"
        strokeWidth={1}
        strokeDasharray="2.5 2.5"
      />
      <line
        x1={r}
        y1={r - arm}
        x2={r}
        y2={r + arm}
        stroke="#94A3B8"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <line
        x1={r - arm}
        y1={r}
        x2={r + arm}
        y2={r}
        stroke="#94A3B8"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}
