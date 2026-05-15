interface AddButtonProps {
  size?: number;
}

export function AddButton({ size = 24 }: AddButtonProps) {
  const r = size / 2;
  const strokeW = 1.5;
  const armLen = size * 0.175;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <circle
        cx={r}
        cy={r}
        r={r - strokeW}
        stroke="#CBD5E1"
        strokeWidth={1}
        strokeDasharray="2 2"
        strokeLinecap="round"
        fill="#F8FAFC"
      />
      <line
        x1={r}
        y1={r - armLen}
        x2={r}
        y2={r + armLen}
        stroke="#94A3B8"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <line
        x1={r - armLen}
        y1={r}
        x2={r + armLen}
        y2={r}
        stroke="#94A3B8"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}
