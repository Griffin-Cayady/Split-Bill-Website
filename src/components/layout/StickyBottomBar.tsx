import { Button } from "../ui/Button";
import { useStepGate } from "../../hooks/useStepGate";

export function StickyBottomBar() {
  const { isFirst, isLast, relevantBlock, goNext, goBack, hint } = useStepGate();

  if (isLast) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 shadow-[0_-6px_20px_rgba(51,41,28,0.18)]" style={{ background: "#33291c" }}>
      {hint && (
        <div className="border-b border-[#5a4a34] px-4 py-1.5 text-center text-xs font-semibold" style={{ color: "#e0a030" }}>
          {hint}
        </div>
      )}
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3" style={{ color: "#fff8ec" }}>
        {!isFirst && (
          <button
            type="button"
            onClick={goBack}
            className="min-h-11 rounded-xl border-[1.5px] px-4 text-sm font-bold"
            style={{ borderColor: "#5a4a34", color: "#fff8ec" }}
          >
            Back
          </button>
        )}
        <Button onClick={goNext} disabled={relevantBlock} className="ml-auto">
          Next
        </Button>
      </div>
    </div>
  );
}
