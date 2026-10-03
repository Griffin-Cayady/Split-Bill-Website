import clsx from "clsx";
import { STEPS, useUIStore, type Step } from "../../store/uiStore";
import { CheckIcon } from "../ui/icons";

const STEP_LABELS: Record<Step, string> = {
  people: "People",
  items: "Items",
  charges: "Tax & tip",
  results: "Totals",
};

export function StepNav() {
  const step = useUIStore((s) => s.step);
  const setStep = useUIStore((s) => s.setStep);
  const current = STEPS.indexOf(step);

  return (
    <nav aria-label="Bill steps" className="px-4 py-4 sm:px-6">
      <ol className="mx-auto flex max-w-6xl gap-1 rounded-2xl border border-border bg-paper-hover p-1">
        {STEPS.map((s, i) => {
          const active = s === step;
          const passed = i < current;
          return (
            <li key={s} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setStep(s)}
                aria-current={active ? "step" : undefined}
                className={clsx(
                  "flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl px-1.5 py-1 font-sans text-label font-semibold whitespace-nowrap transition-[color,background-color,transform] duration-200 active:scale-[0.97] sm:min-h-12 sm:gap-2.5 sm:px-4 sm:text-secondary",
                  active ? "bg-chrome text-chrome-ink shadow-press" : passed ? "text-ink hover:bg-paper-raised" : "text-ink-soft hover:bg-paper-raised hover:text-ink",
                )}
              >
                <span
                  className={clsx(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-label font-semibold sm:h-7 sm:w-7",
                    active ? "bg-accent text-accent-ink" : passed ? "bg-ink text-paper" : "border border-field-border text-ink-soft",
                  )}
                >
                  {passed ? <CheckIcon width={13} height={13} strokeWidth={3} aria-hidden="true" /> : i + 1}
                </span>
                {STEP_LABELS[s]}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
