import { forwardRef, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink shadow-press hover:bg-accent-hover",
  secondary: "bg-paper-raised text-ink border border-border hover:bg-paper-hover",
  ghost: "bg-transparent text-ink-soft hover:text-ink hover:bg-paper-hover",
  danger: "bg-danger text-paper-raised hover:brightness-110",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-[0.95rem] gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-sans font-semibold transition-[color,background-color,transform] duration-150 active:scale-[0.97] disabled:opacity-55 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});
