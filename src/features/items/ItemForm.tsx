import { useBillStore } from "../../store/billStore";
import { Stepper } from "../../components/ui/Stepper";
import { ItemPriceField } from "./ItemPriceField";
import { TrashIcon } from "../../components/ui/icons";
import { itemNetTotal } from "../../lib/calc";
import { formatMoney } from "../../lib/currency";
import type { Item } from "../../lib/types";

export function ItemForm({ item, onDelete }: { item: Item; onDelete: () => void }) {
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
          className="h-12 min-w-0 flex-1 border-0 border-b-[1.5px] border-field-border bg-transparent px-0.5 font-display text-title font-semibold tracking-tight text-ink transition-colors placeholder:font-sans placeholder:font-normal placeholder:text-ink-faint hover:border-ink focus:border-accent focus:shadow-[0_1.5px_0_0_var(--accent)] focus:outline-none"
        />
        {item.price > 0 && (
          <span className="tabular-money shrink-0 pl-2 text-body-lg font-semibold text-ink">{formatMoney(itemNetTotal(item), currency)}</span>
        )}
        <button
          type="button"
          aria-label={`Delete ${item.name.trim() || "unnamed item"}`}
          onClick={onDelete}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-paper-hover hover:text-accent-hover"
        >
          <TrashIcon />
        </button>
      </div>
      <div className="flex items-center gap-2.5">
        <ItemPriceField item={item} className="flex-1" />
        <Stepper
          value={item.quantity}
          onChange={(v) => updateItem(item.id, { quantity: Math.max(1, Math.round(v)) })}
          min={1}
          ariaLabel="quantity"
        />
      </div>
    </div>
  );
}
