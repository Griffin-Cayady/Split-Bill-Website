import clsx from "clsx";
import { Avatar } from "../../components/ui/Avatar";
import { Stepper } from "../../components/ui/Stepper";
import { useBillStore } from "../../store/billStore";
import type { Item } from "../../lib/types";

export function EqualModeAssign({ item }: { item: Item }) {
  const people = useBillStore((s) => s.bill.people);
  const updateItem = useBillStore((s) => s.updateItem);
  const ids = item.equalPersonIds ?? [];
  const quantities = item.equalQuantities ?? [];

  function quantityFor(personId: string): number {
    const explicit = quantities.find((q) => q.personId === personId)?.quantity;
    if (explicit !== undefined) return explicit;
    return ids.includes(personId) ? 1 : 0;
  }

  function setQuantity(personId: string, value: number) {
    const quantity = Math.max(0, Math.round(value));
    const nextQuantities = [...quantities.filter((q) => q.personId !== personId), ...(quantity > 0 ? [{ personId, quantity }] : [])];
    const nextIds = quantity > 0 ? (ids.includes(personId) ? ids : [...ids, personId]) : ids.filter((id) => id !== personId);
    updateItem(item.id, { equalPersonIds: nextIds, equalQuantities: nextQuantities });
  }

  if (people.length === 0) return <p className="text-sm text-ink-soft">Add people first.</p>;

  return (
    <div className="flex flex-col gap-2">
      {people.map((p) => {
        const quantity = quantityFor(p.id);
        const included = quantity > 0;
        return (
          <div
            key={p.id}
            className={clsx("flex flex-wrap items-center gap-3 rounded-xl px-3 py-2 transition-colors", included ? "bg-paper" : "")}
          >
            <Avatar name={p.name} color={p.color} size="sm" />
            <span className={clsx("flex-1 truncate text-base font-bold", included ? "text-ink" : "text-ink-faint")}>{p.name}</span>
            <Stepper value={quantity} onChange={(v) => setQuantity(p.id, v)} min={0} ariaLabel={`Shares for ${p.name}`} />
          </div>
        );
      })}
      <p className="text-label text-ink-soft">Give everyone who shared it 1. Someone who had a double helping gets 2; 0 leaves them out.</p>
    </div>
  );
}
