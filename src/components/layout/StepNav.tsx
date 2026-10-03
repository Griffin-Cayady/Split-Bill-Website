import clsx from "clsx";
import { STEPS, useUIStore, type Step } from "../../store/uiStore";
import { CheckIcon } from "../ui/icons";

const STEP_LABELS: Record<Step, string> = {
  people: "People",
  items: "Items",
  charges: "Tax & tip",
  results: "Totals",
};

/** Underlined tabs on a single hairline: the current step carries the accent bar, finished steps a tick. */
export function StepNav() {
  const step = useUIStore((s) => s.step);
  const setStep = useUIStore((s) => s.setStep);
  const current = STEPS.indexOf(step);

  return (
    <nav aria-label="Bill steps" className="px-4 sm:px-6">
      <ol className="mx-auto flex max-w-6xl border-b border-border">
        {STEPS.map((s, i) => {
          const active = s === step;
          const passed = i < current;
          return (
            <li key={s} className="min-w-0 flex-1 sm:flex-none">
              <button
                type="button"
                onClick={() => setStep(s)}
                aria-current={active ? "step" : undefined}
                className={clsx(
                  "relative -mb-px flex min-h-12 w-full items-center justify-center gap-2 border-b-2 px-1 text-sm whitespace-nowrap transition-colors duration-150 sm:justify-start sm:px-4",
                  active
                    ? "border-accent font-semibold text-ink"
                    : passed
                      ? "border-transparent font-medium text-ink hover:border-field-border"
                      : "border-transparent font-medium text-ink-soft hover:border-field-border hover:text-ink",
                )}
              >
                {passed ? (
                  <CheckIcon width={14} height={14} aria-hidden="true" className="shrink-0 text-teal" />
                ) : (
                  <span aria-hidden="true" className={clsx("hidden font-mono text-label sm:inline", active ? "text-accent" : "text-ink-faint")}>
                    {i + 1}
                  </span>
                )}
                {STEP_LABELS[s]}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
