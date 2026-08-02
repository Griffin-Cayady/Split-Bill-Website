import { useBillStore } from "../../store/billStore";
import { Stepper } from "../../components/ui/Stepper";
import { ItemPriceField } from "./ItemPriceField";
import { TrashIcon } from "../../components/ui/icons";
import type { Item } from "../../lib/types";

export function ItemForm({ item, onDelete }: { item: Item; onDelete: () => void }) {
  const updateItem = useBillStore((s) => s.updateItem);

  return (
    <div className="flex flex-1 flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <input
          value={item.name}
          onChange={(e) => updateItem(item.id, { name: e.target.value })}
          placeholder="Item name"
          aria-label="Item name"
          className="h-12 min-w-0 flex-1 rounded-xl border-[1.5px] border-border bg-paper px-3.5 text-[17px] font-semibold text-ink placeholder:text-ink-faint placeholder:font-normal focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
        />
        <button
          type="button"
          aria-label={`Delete ${item.name || "item"}`}
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
