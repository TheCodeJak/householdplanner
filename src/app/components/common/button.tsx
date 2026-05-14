import { type ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "primary"
  | "ghost"
  | "success"
  | "warning"
  | "error";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  ghost: "bg-slate-100 text-slate-600 hover:bg-slate-200",
  success: "bg-success-600 text-white hover:bg-success-700",
  warning: "bg-warning-500 text-white hover:bg-warning-600",
  error: "bg-error-600 text-white hover:bg-error-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-5 py-3 text-sm rounded-xl",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`cursor-pointer font-semibold transition active:scale-[.98] ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
