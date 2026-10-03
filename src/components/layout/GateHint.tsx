import clsx from "clsx";
import { jumpToItem } from "../../features/items/jumpToItem";

interface GateHintProps {
  hint: string;
  hintItemId?: string;
  issueItemCount: number;
  className?: string;
}

/** What is blocking "Next". When it concerns an item, it is a button that jumps to that item. */
export function GateHint({ hint, hintItemId, issueItemCount, className }: GateHintProps) {
  const more = issueItemCount > 1 ? ` (+${issueItemCount - 1} more)` : "";

  if (!hintItemId) {
    return (
      <span role="status" className={className}>
        {hint}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => jumpToItem(hintItemId)}
      className={clsx("underline decoration-1 underline-offset-[3px] hover:decoration-2", className)}
    >
      {hint}
      {more} <span aria-hidden="true">→</span>
    </button>
  );
}
