import { Button } from "../ui/Button";
import { GateHint } from "./GateHint";
import { useStepGate } from "../../hooks/useStepGate";
import { useBillStore } from "../../store/billStore";

/** Inline Back/hint/Next controls shown at the end of every step's content, on every viewport. */
export function StepFooterNav() {
  const bill = useBillStore((s) => s.bill);
  const { isFirst, isLast, relevantBlock, goNext, goBack, hint, hintItemId, issueItemCount } = useStepGate(bill);

  if (isLast) return null;

  return (
    <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-border pt-5">
      {!isFirst ? (
        <Button variant="secondary" onClick={goBack}>
          ← Back
        </Button>
      ) : (
        <span />
      )}
      {hint && (
        <GateHint
          hint={hint}
          hintItemId={hintItemId}
          issueItemCount={issueItemCount}
          className="ml-auto text-right text-sm font-semibold text-amber"
        />
      )}
      <Button onClick={goNext} disabled={relevantBlock} className={hint ? "" : "ml-auto"}>
        Next →
      </Button>
    </div>
  );
}
