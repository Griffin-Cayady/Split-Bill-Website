import { useEffect, useRef } from "react";
import { Button } from "../ui/Button";
import { GateHint } from "./GateHint";
import { useStepGate } from "../../hooks/useStepGate";
import { useBillStore } from "../../store/billStore";
import { computeBillResult } from "../../lib/calc";
import { formatMoney } from "../../lib/currency";

/**
 * Below the desktop breakpoint the running total and the Back/Next controls
 * live here, in thumb reach. The bar publishes its height as
 * --bottom-bar-h so toasts can stack above it instead of covering Next.
 */
export function StickyBottomBar() {
  const bill = useBillStore((s) => s.bill);
  const { isFirst, isLast, relevantBlock, goNext, goBack, hint, hintItemId, issueItemCount } = useStepGate(bill);
  const barRef = useRef<HTMLDivElement>(null);
  const total = bill.items.length > 0 ? computeBillResult(bill).grandTotal : null;

  useEffect(() => {
    const el = barRef.current;
    const root = document.documentElement;
    if (!el) {
      root.style.removeProperty("--bottom-bar-h");
      return;
    }
    const observer = new ResizeObserver(() => root.style.setProperty("--bottom-bar-h", `${el.offsetHeight}px`));
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--bottom-bar-h");
    };
  }, [isLast]);

  if (isLast) return null;

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_rgba(51,41,28,0.18)]"
      style={{ background: "#33291c" }}
    >
      {hint && (
        <div className="border-b border-[#5a4a34] px-4 py-2 text-center text-[13px] font-semibold" style={{ color: "#e0a030" }}>
          <GateHint hint={hint} hintItemId={hintItemId} issueItemCount={issueItemCount} className="min-h-6" />
        </div>
      )}
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3" style={{ color: "#fff8ec" }}>
        {!isFirst && (
          <button
            type="button"
            onClick={goBack}
            className="min-h-11 shrink-0 rounded-xl border-[1.5px] px-4 text-sm font-bold"
            style={{ borderColor: "#5a4a34", color: "#fff8ec" }}
          >
            Back
          </button>
        )}
        {total !== null && (
          <div className="min-w-0 leading-tight" aria-live="polite">
            <div className="text-[13px] font-semibold opacity-75">Total so far</div>
            <div className="tabular-money truncate text-base font-bold">{formatMoney(total, bill.currency)}</div>
          </div>
        )}
        <Button onClick={goNext} disabled={relevantBlock} className="ml-auto shrink-0">
          Next
        </Button>
      </div>
    </div>
  );
}
