import { useState } from "react";
import { useBillStore } from "../../store/billStore";
import { useUIStore } from "../../store/uiStore";
import { undoableBillChange } from "../../store/undoableBillChange";
import { ConfirmDialog } from "../ui/ConfirmDialog";

/** "Clear bill": a deliberately quiet control. Clearing needs confirmation and can still be undone. */
export function ResetBillButton() {
  const resetBill = useBillStore((s) => s.resetBill);
  const setStep = useUIStore((s) => s.setStep);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleConfirm() {
    setConfirmOpen(false);
    const previousStep = useUIStore.getState().step;
    // Undoing lands the user back on the step they cleared from.
    undoableBillChange("Bill cleared", resetBill, () => setStep(previousStep));
    setStep("people");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="ml-auto flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-semibold whitespace-nowrap text-ink-soft transition-[color,background-color,transform] hover:bg-paper-hover hover:text-accent-hover active:scale-[0.97]"
      >
        Clear bill
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Clear this bill?"
        description="People, items and charges will all be removed. You can undo this for a few seconds afterwards."
        confirmLabel="Clear bill"
        cancelLabel="Keep bill"
        danger
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
