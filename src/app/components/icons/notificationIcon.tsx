type IconProps = {
  size?: number;
  className?: string;
};

export function NotificationIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size + 4}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <g fillRule="evenodd" clipRule="evenodd">
        <path d="M15,19 C15,20.0543909 14.18415,20.9181678 13.1492661,20.9945144 L13,21 L11,21 C9.94563773,21 9.08183483,20.18415 9.00548573,19.1492661 L9,19 L15,19 Z M12.0002,2 C15.7856583,2 18.869299,5.0047865 18.996141,8.75935044 L19.0002,9 L19.0002,12.7639 L20.8222,16.4081 C21.1704857,17.1046714 20.7047125,17.9183404 19.9532033,17.9942531 L19.8384,18 L4.16197,18 C3.38318905,18 2.86370061,17.2195011 3.13189688,16.5133571 L3.1781,16.4081 L5.00016,12.7639 L5.00016,9 C5.00016,5.13401 8.13417,2 12.0002,2 Z" />
      </g>
    </svg>
  );
}
