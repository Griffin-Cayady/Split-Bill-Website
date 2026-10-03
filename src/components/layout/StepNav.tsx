import clsx from "clsx";
import { STEPS, useUIStore, type Step } from "../../store/uiStore";

const STEP_LABELS: Record<Step, string> = {
  people: "People",
  items: "Items",
  charges: "Tax & tip",
  results: "Totals",
};

export function StepNav() {
  const step = useUIStore((s) => s.step);
  const setStep = useUIStore((s) => s.setStep);

  return (
    <nav aria-label="Bill steps" className="px-4 py-4 sm:px-6">
      <ol className="mx-auto flex max-w-6xl overflow-hidden rounded-2xl border-[1.5px] border-border bg-paper-raised">
        {STEPS.map((s, i) => {
          const active = s === step;
          return (
            <li key={s} className={clsx("min-w-0 flex-1", i > 0 && "border-l-[1.5px] border-border")}>
              <button
                type="button"
                onClick={() => setStep(s)}
                aria-current={active ? "step" : undefined}
                className={clsx(
                  "flex min-h-11 w-full items-center justify-center gap-1.5 px-1.5 py-1 font-sans text-label font-bold whitespace-nowrap transition-colors sm:min-h-12 sm:gap-2.5 sm:px-4 sm:text-secondary",
                  active ? "bg-accent text-accent-ink" : "text-ink hover:bg-paper-hover",
                )}
              >
                <span
                  className={clsx(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-label font-extrabold sm:h-8 sm:w-8 sm:text-secondary",
                    active ? "bg-white/25 text-accent-ink" : "bg-paper-hover text-ink-soft",
                  )}
                >
                  {i + 1}
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
