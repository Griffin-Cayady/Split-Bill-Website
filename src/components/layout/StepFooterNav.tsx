import { Button } from "../ui/Button";
import { useStepGate } from "../../hooks/useStepGate";

/** Inline Back/hint/Next controls shown at the end of every step's content, on every viewport. */
export function StepFooterNav() {
  const { isFirst, isLast, relevantBlock, goNext, goBack, hint } = useStepGate();

  if (isLast) return null;

  return (
    <div className="mt-7 flex flex-wrap items-center gap-3 border-t-[1.5px] border-dashed border-border pt-5">
      {!isFirst ? (
        <Button variant="secondary" onClick={goBack}>
          ← Back
        </Button>
      ) : (
        <span />
      )}
      {hint && <span className="ml-auto text-right text-sm font-semibold text-amber">{hint}</span>}
      <Button onClick={goNext} disabled={relevantBlock} className={hint ? "" : "ml-auto"}>
        Next →
      </Button>
    </div>
  );
}
