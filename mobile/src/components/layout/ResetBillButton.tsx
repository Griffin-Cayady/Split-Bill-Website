import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useBillStore } from "@/store/billStore";
import { useUIStore } from "@shared/store/uiStore";

/** "Start over" — clears only after the user confirms. */
export function ResetBillButton() {
  const resetBill = useBillStore((s) => s.resetBill);
  const setStep = useUIStore((s) => s.setStep);
  const pushToast = useUIStore((s) => s.pushToast);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)} className="w-full">
        Start over
      </Button>
      <ConfirmDialog
        open={open}
        title="Reset this bill?"
        description="People, items, and charges will all be cleared. This can't be undone."
        confirmLabel="OK"
        danger
        onConfirm={() => {
          setOpen(false);
          resetBill();
          setStep("people");
          pushToast("Started a fresh bill");
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
