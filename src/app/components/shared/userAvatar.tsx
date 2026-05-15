import { useId } from "react";

const INITIAL_COLORS: Record<string, string> = {
  A: "#EF6C6C",
  B: "#F28B4F",
  C: "#E8B84B",
  D: "#4CAF82",
  E: "#38B2AC",
  F: "#5B8DEF",
  G: "#9B7FEA",
  H: "#EC6D9E",
  I: "#F07050",
  J: "#7C6FF7",
  K: "#3BB08F",
  L: "#4A9FD4",
  M: "#E87B6A",
  N: "#D4A843",
  O: "#49BFA8",
  P: "#8B7FE8",
  Q: "#D96B9B",
  R: "#D95F5F",
  S: "#3EBDBD",
  T: "#5DA8E8",
  U: "#8A9BB5",
  V: "#7EB5D6",
  W: "#A8B8CC",
  X: "#5A6A7E",
  Y: "#E8A07A",
  Z: "#5EC4C4",
};

function getColor(initial: string): string {
  return INITIAL_COLORS[initial.toUpperCase()] ?? "#8A9BB5";
}

function lightenHex(hex: string, amount = 0.35): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(
    ((n >> 16) & 0xff) + (255 - ((n >> 16) & 0xff)) * amount,
  );
  const g = Math.round(((n >> 8) & 0xff) + (255 - ((n >> 8) & 0xff)) * amount);
  const b = Math.round((n & 0xff) + (255 - (n & 0xff)) * amount);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

interface UserAvatarProps {
  initial: string;
  color?: string;
  completed?: boolean;
  size?: number;
}

export function UserAvatar({
  initial,
  color,
  completed = false,
  size = 24,
}: UserAvatarProps) {
  const uid = useId();
  const bgColor = color ?? getColor(initial);
  const highlightColor = lightenHex(bgColor, 0.4);
  const r = size / 2;
  const gradId = `grad-${uid}`;
  const maskId = `mask-${uid}`;

  const badgeR = size * 0.21;
  const badgeX = size - badgeR * 0.72;
  const badgeY = size - badgeR * 0.72;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      overflow="visible"
    >
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor={highlightColor} />
          <stop offset="100%" stopColor={bgColor} />
        </radialGradient>
        {completed && (
          <mask id={maskId}>
            <circle cx={r} cy={r} r={r} fill="white" />
          </mask>
        )}
      </defs>

      <circle cx={r} cy={r} r={r} fill={`url(#${gradId})`} />

      {completed && (
        <circle cx={r} cy={r} r={r} fill="black" fillOpacity={0.12} />
      )}

      <text
        x={r}
        y={r}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={size * 0.38}
        fontWeight="600"
        style={{ userSelect: "none" }}
      >
        {initial.toUpperCase()}
      </text>

      {completed && (
        <g transform={`translate(${badgeX} ${badgeY})`}>
          <circle r={badgeR} fill="#22C55E" />
          <polyline
            points={`${-badgeR * 0.38},0 ${-badgeR * 0.08},${badgeR * 0.34} ${badgeR * 0.42},${-badgeR * 0.3}`}
            stroke="white"
            strokeWidth={badgeR * 0.3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  );
}
