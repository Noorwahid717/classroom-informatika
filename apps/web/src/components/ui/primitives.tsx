import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from "react";

type ButtonVariant = "default" | "outline" | "secondary" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantStyles: Record<ButtonVariant, string> = {
  default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border-border bg-transparent text-foreground hover:bg-muted",
  secondary: "border-border bg-muted text-foreground hover:bg-muted/80",
  destructive: "border-red-200 bg-red-500 text-white hover:bg-red-600"
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base"
};

export function Button({
  className = "",
  variant = "default",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg border font-medium shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const computedClassName = [
    baseClasses,
    variantStyles[variant],
    sizeStyles[size],
    className
  ]
    .filter(Boolean)
    .join(" ");

  return <button {...props} type={type} className={computedClassName} />;
}

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`rounded border border-gray-200 bg-white shadow-sm ${className}`.trim()} />;
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 ${className}`.trim()}
    />
  );
}
