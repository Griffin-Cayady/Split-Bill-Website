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
      className={clsx("inline-flex overflow-hidden rounded-xl border-[1.5px] border-border", className)}
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
              "min-h-12 flex-1 px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors duration-150",
              active ? "bg-accent text-accent-ink" : "bg-paper-raised text-ink hover:bg-paper-hover",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
