import { useBillStore } from "./billStore";
import { useUIStore } from "./uiStore";

/**
 * Applies a destructive bill change and offers an "Undo" toast that restores
 * the bill exactly as it was. The undo is withdrawn as soon as the bill
 * changes again, so restoring can never overwrite later edits.
 */
export function undoableBillChange(message: string, mutate: () => void, onUndo?: () => void) {
  const before = useBillStore.getState().bill;
  mutate();
  const after = useBillStore.getState().bill;
  if (after === before) return;

  const { pushToast, dismissToast } = useUIStore.getState();
  let unsubscribe = () => {};
  const toastId = pushToast(message, {
    label: "Undo",
    onAction: () => {
      unsubscribe();
      if (useBillStore.getState().bill !== after) return;
      useBillStore.getState().loadBill(before);
      onUndo?.();
    },
  });
  unsubscribe = useBillStore.subscribe((state) => {
    if (state.bill !== after) {
      unsubscribe();
      dismissToast(toastId);
    }
  });
}
