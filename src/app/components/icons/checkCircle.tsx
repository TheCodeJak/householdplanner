import { IconProps } from ".";

export function CheckCircleIcon({ size = 10, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      className={className}
    >
      <circle cx="5" cy="5" r="5" fill="currentColor" />
      <path
        d="M2.5 5l2 2 3-3"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
