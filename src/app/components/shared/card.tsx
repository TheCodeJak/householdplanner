interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  style,
  className,
  onClick,
  ...props
}: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      {...props}
      className={`
        flex w-full min-h-17.5 items-center gap-4 rounded-2xl bg-brand-50/5 
        border border-brand-50 shadow-sm my-2 px-4 py-3.5 ${className} 
        ${onClick && "transition-all active:scale-[99.5%] hover:bg-brand-50 hover:scale-[100.5%]"}
      `}
    >
      {children}
    </div>
  );
}
