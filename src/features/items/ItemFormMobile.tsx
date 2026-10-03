import clsx from "clsx";
import { fieldClass } from "../../components/ui/field";
import { useBillStore } from "../../store/billStore";
import { Stepper } from "../../components/ui/Stepper";
import { ItemPriceField } from "./ItemPriceField";
import { ItemDiscount } from "./ItemDiscount";
import { TrashIcon } from "../../components/ui/icons";
import type { Item } from "../../lib/types";

/** Mobile-only item layout: name + delete, then price + qty stepper, then discount trigger. */
export function ItemFormMobile({ item, onDelete }: { item: Item; onDelete: () => void }) {
  const updateItem = useBillStore((s) => s.updateItem);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <input
          value={item.name}
          onChange={(e) => updateItem(item.id, { name: e.target.value })}
          placeholder="Item name"
          aria-label="Item name"
          className={clsx(fieldClass, "h-11 min-w-0 flex-1 px-3 text-body-lg font-semibold")}
        />
        <button
          type="button"
          aria-label={`Delete ${item.name.trim() || "unnamed item"}`}
          onClick={onDelete}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-paper-hover hover:text-danger"
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

      {!item.discount && <ItemDiscount item={item} compact />}
    </div>
  );
}
