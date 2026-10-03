import { useBillStore } from "../../store/billStore";
import { undoableBillChange } from "../../store/undoableBillChange";
import { ItemRow } from "./ItemRow";
import { PlusIcon } from "../../components/ui/icons";
import type { Item } from "../../lib/types";

export function ItemsStep() {
  const bill = useBillStore((s) => s.bill);
  const items = bill.items;
  const addItem = useBillStore((s) => s.addItem);
  const removeItem = useBillStore((s) => s.removeItem);

  function handleDelete(item: Item) {
    const name = item.name.trim();
    undoableBillChange(name ? `Deleted "${name}"` : "Deleted item", () => removeItem(item.id));
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
    </div>
  );
}
