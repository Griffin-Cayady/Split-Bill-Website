import { MinusIcon, PlusIcon } from "./icons";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel: string;
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export function Stepper({ value, onChange, min = 0, max = Infinity, step = 1, ariaLabel }: StepperProps) {
  function clamp(v: number): number {
    return Math.min(max, Math.max(min, round2(v)));
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        aria-label={`Decrease ${ariaLabel}`}
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
        className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-border text-ink transition-colors hover:bg-paper-hover disabled:opacity-30"
      >
        <MinusIcon width={16} height={16} />
      </button>
      <input
        type="number"
        inputMode="decimal"
        aria-label={ariaLabel}
        value={value}
        step="any"
        onChange={(e) => {
          const v = Number.parseFloat(e.target.value);
          onChange(Number.isNaN(v) ? min : clamp(v));
        }}
        className="h-11 w-14 rounded-xl border-[1.5px] border-field-border bg-paper-raised text-center font-mono tabular-nums text-ink focus:border-accent focus:ring-2 focus:ring-accent/60 focus:outline-none"
      />
      <button
        type="button"
        aria-label={`Increase ${ariaLabel}`}
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
        className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-border text-ink transition-colors hover:bg-paper-hover disabled:opacity-30"
      >
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  );
}
