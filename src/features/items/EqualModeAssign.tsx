import clsx from "clsx";
import { Avatar } from "../../components/ui/Avatar";
import { Stepper } from "../../components/ui/Stepper";
import { CheckIcon } from "../../components/ui/icons";
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

  // Adds everyone not yet on the item with one portion; existing portions are kept.
  function includeEveryone() {
    const missing = people.filter((p) => quantityFor(p.id) === 0).map((p) => p.id);
    updateItem(item.id, {
      equalPersonIds: [...ids.filter((id) => quantityFor(id) > 0), ...missing],
      equalQuantities: [...quantities.filter((q) => q.quantity > 0), ...missing.map((personId) => ({ personId, quantity: 1 }))],
    });
  }

  if (people.length === 0) return <p className="text-sm text-ink-soft">Add people first.</p>;

  const includedCount = people.filter((p) => quantityFor(p.id) > 0).length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-soft">Tap everyone who shared it. Use + for anyone who had a bigger portion.</p>
        {includedCount < people.length && (
          <button
            type="button"
            onClick={includeEveryone}
            className="min-h-9 rounded-lg px-2.5 text-sm font-semibold text-ink underline decoration-field-border underline-offset-4 transition-colors hover:decoration-ink"
          >
            Everyone shared it
          </button>
        )}
      </div>

      <ul className="flex flex-col divide-y divide-dashed divide-border rounded-xl border border-border">
        {people.map((p) => {
          const quantity = quantityFor(p.id);
          const included = quantity > 0;
          const name = p.name.trim() || "Unnamed";
          return (
            <li key={p.id} className="flex min-h-14 items-center gap-2 py-1.5 pr-2 pl-1.5">
              <button
                type="button"
                aria-pressed={included}
                aria-label={`${name} shared ${item.name.trim() || "this item"}`}
                onClick={() => setQuantity(p.id, included ? 0 : 1)}
                className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg px-2 text-left transition-[background-color,transform] duration-150 hover:bg-paper-hover active:scale-[0.99]"
              >
                <span
                  aria-hidden="true"
                  className={clsx(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors",
                    included ? "border-ink bg-ink text-paper" : "border-field-border",
                  )}
                >
                  {included && <CheckIcon width={13} height={13} strokeWidth={3} />}
                </span>
                <Avatar name={p.name} color={p.color} size="sm" />
                <span className={clsx("truncate text-base", included ? "font-semibold text-ink" : "text-ink-soft")}>{name}</span>
              </button>
              {included && (
                <Stepper value={quantity} onChange={(v) => setQuantity(p.id, v)} min={0} ariaLabel={`Portions for ${name}`} />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
