import { useState } from "react";
import { useBillStore } from "../../store/billStore";
import { useUIStore } from "../../store/uiStore";
import { ConfirmDialog } from "../ui/ConfirmDialog";

/** "Start over" — opens a confirmation popup; clearing only happens if the user confirms. */
export function ResetBillButton() {
  const resetBill = useBillStore((s) => s.resetBill);
  const setStep = useUIStore((s) => s.setStep);
  const pushToast = useUIStore((s) => s.pushToast);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleConfirm() {
    setConfirmOpen(false);
    resetBill();
    setStep("people");
    pushToast("Started a fresh bill");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="ml-auto flex min-h-11 w-full items-center justify-center rounded-xl border-[1.5px] border-accent bg-accent px-4 text-sm font-bold whitespace-nowrap text-accent-ink transition-colors hover:bg-accent-hover sm:w-auto"
      >
        Start over
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Reset this bill?"
        description="People, items, and charges will all be cleared. This can't be undone."
        confirmLabel="OK"
        danger
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
