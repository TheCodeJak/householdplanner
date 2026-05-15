import { IconProps } from ".";

export function QuestionCircleIcon({ size = 40, className }: IconProps) {
  const r = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={className}
    >
      <circle cx={r} cy={r} r={r - 0.5} stroke="#CBD5E1" strokeWidth={1} />
      <text
        x={r}
        y={r}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#94A3B8"
        fontSize={size * 0.45}
        fontWeight="600"
      >
        ?
      </text>
    </svg>
  );
}
