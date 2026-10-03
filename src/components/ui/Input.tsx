import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  mono?: boolean;
}

export function Input({ label, error, mono, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          "h-12 rounded-xl border-[1.5px] border-border bg-paper-raised px-3.5 text-ink placeholder:text-ink-faint",
          "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/60",
          mono && "font-mono tabular-nums",
          error && "border-accent",
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <span className="text-xs text-accent">{error}</span>}
    </div>
  );
}
