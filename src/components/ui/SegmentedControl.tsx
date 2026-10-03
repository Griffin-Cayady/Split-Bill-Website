import clsx from "clsx";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  ...aria
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={aria["aria-label"]}
      // A recessed track with the chosen option raised out of it: selection reads
      // through elevation and ink weight, leaving the accent colour to primary actions.
      className={clsx("inline-flex gap-1 rounded-xl border border-border bg-paper-hover p-1", className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={clsx(
              "min-h-10 flex-1 rounded-lg px-3.5 py-2 text-sm whitespace-nowrap transition-[color,background-color,box-shadow,transform] duration-150 active:scale-[0.97]",
              active
                ? "bg-paper-raised font-bold text-ink shadow-[0_0_0_1px_var(--field-border),var(--shadow-press)]"
                : "font-semibold text-ink-soft hover:text-ink",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
