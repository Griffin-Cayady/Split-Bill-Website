import { useCallback } from "react";
import { useBillStore } from "../../store/billStore";
import { useUndoableDelete } from "../../hooks/useUndoableDelete";
import { useMediaQuery, isMobileQuery } from "../../hooks/useMediaQuery";
import { computeBillResult } from "../../lib/calc";
import { formatMoney } from "../../lib/currency";
import { ItemRow } from "./ItemRow";
import { PlusIcon } from "../../components/ui/icons";
import type { Item } from "../../lib/types";

export function ItemsStep() {
  const bill = useBillStore((s) => s.bill);
  const items = bill.items;
  const addItem = useBillStore((s) => s.addItem);
  const removeItem = useBillStore((s) => s.removeItem);
  const addItemAt = useBillStore((s) => s.addItemAt);
  const isMobile = useMediaQuery(isMobileQuery);
  const billSubtotal = computeBillResult(bill).billSubtotal;

  const onRestore = useCallback((item: Item, index: number) => addItemAt(item, index), [addItemAt]);
  const { pending, scheduleDelete, undo } = useUndoableDelete<Item>(onRestore);

  function handleDelete(item: Item) {
    const index = items.findIndex((it) => it.id === item.id);
    removeItem(item.id);
    scheduleDelete(item, index);
  }

  return (
    <div className="flex flex-col gap-5 pb-16">
      <div>
        <h1 className="font-display text-[30px] font-extrabold tracking-tight text-ink">What did you order?</h1>
        <p className="mt-1.5 text-base text-ink-soft">Add each dish, then tap the people who shared it.</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-border px-6 py-8 text-center">
          <p className="text-base text-ink-soft">No items yet — add the first one below.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <ItemRow key={item.id} item={item} onDelete={() => handleDelete(item)} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => addItem()}
        className="min-h-[52px] w-full rounded-xl border-[1.5px] border-dashed border-accent bg-accent-soft px-6 text-base font-bold text-accent-hover hover:brightness-95"
      >
        <PlusIcon width={18} height={18} className="mr-1.5 inline align-text-bottom" />
        Add another item
      </button>

      {isMobile && items.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border-[1.5px] border-border bg-paper-raised px-4 py-3.5">
          <span className="font-mono text-xs font-bold tracking-wide text-ink-soft uppercase">Subtotal</span>
          <span className="tabular-money text-lg font-bold text-ink">{formatMoney(billSubtotal, bill.currency)}</span>
        </div>
      )}

      {pending && (
        <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 lg:bottom-6">
          <div
            className="flex items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold shadow-xl"
            style={{ background: "#33291c", color: "#fff8ec" }}
          >
            <span className="truncate">Deleted "{pending.item.name || "item"}"</span>
            <button type="button" onClick={undo} className="rounded-full bg-accent px-4 py-2 text-sm font-extrabold text-white">
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
