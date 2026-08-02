import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { useBillStore } from "../../store/billStore";
import type { Bill } from "../../lib/types";

export function EditACopyButton({ bill }: { bill: Bill }) {
  const loadBill = useBillStore((s) => s.loadBill);
  const currentBill = useBillStore((s) => s.bill);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const currentHasContent = currentBill.people.length > 0 || currentBill.items.length > 0;

  function editCopy() {
    loadBill(bill);
    history.replaceState(null, "", window.location.pathname + window.location.search);
    window.location.reload();
  }

  return (
    <>
      <Button variant="secondary" onClick={() => (currentHasContent ? setConfirmOpen(true) : editCopy())}>
        Edit a copy
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        title="Replace your current bill?"
        description="You have an in-progress bill saved on this device. Editing this shared copy will replace it."
        confirmLabel="Replace & edit"
        danger
        onConfirm={() => {
          setConfirmOpen(false);
          editCopy();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
