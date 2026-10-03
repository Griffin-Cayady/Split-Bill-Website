import type { ReactNode } from "react";
import clsx from "clsx";
import { fieldClass } from "../../components/ui/field";
import { useBillStore } from "../../store/billStore";
import { Stepper } from "../../components/ui/Stepper";
import { ItemPriceField } from "./ItemPriceField";
import { TrashIcon } from "../../components/ui/icons";
import { itemNetTotal } from "../../lib/calc";
import { formatMoney } from "../../lib/currency";
import type { Item } from "../../lib/types";

/** Desktop item header: name, line total and delete; then price, quantity and an optional trailing control. */
export function ItemForm({ item, onDelete, trailing }: { item: Item; onDelete: () => void; trailing?: ReactNode }) {
  const updateItem = useBillStore((s) => s.updateItem);
  const currency = useBillStore((s) => s.bill.currency);

  return (
    <div className="flex flex-1 flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <input
          value={item.name}
          onChange={(e) => updateItem(item.id, { name: e.target.value })}
          placeholder="Item name"
          aria-label="Item name"
          className={clsx(fieldClass, "h-11 min-w-0 flex-1 px-3 text-body-lg font-semibold")}
        />
        {item.price > 0 && (
          <span className="tabular-money shrink-0 pl-3 text-body-lg font-semibold text-ink">{formatMoney(itemNetTotal(item), currency)}</span>
        )}
        <button
          type="button"
          aria-label={`Delete ${item.name.trim() || "unnamed item"}`}
          onClick={onDelete}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-paper-hover hover:text-danger"
        >
          <TrashIcon />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-3">
        <ItemPriceField item={item} className="w-48" />
        <span aria-hidden="true" className="text-sm text-ink-soft">×</span>
        <Stepper
          value={item.quantity}
          onChange={(v) => updateItem(item.id, { quantity: Math.max(1, Math.round(v)) })}
          min={1}
          ariaLabel="quantity"
        />
        {trailing && <div className="ml-auto">{trailing}</div>}
      </div>
    </div>
  );
}
