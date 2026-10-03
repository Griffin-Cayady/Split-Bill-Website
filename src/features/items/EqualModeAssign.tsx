import { useState } from "react";
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

  const included = people.filter((p) => quantityFor(p.id) > 0);
  // Portions stay tucked away until someone actually has more than one.
  const [portionsOpen, setPortionsOpen] = useState(() => included.some((p) => quantityFor(p.id) > 1));

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

  const itemName = item.name.trim() || "this item";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h3 className="text-sm font-medium text-ink-soft">Who shared it?</h3>
        {included.length < people.length && (
          <button
            type="button"
            onClick={includeEveryone}
            className="min-h-9 rounded-lg px-2 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft"
          >
            Everyone
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {people.map((p) => {
          const quantity = quantityFor(p.id);
          const on = quantity > 0;
          const name = p.name.trim() || "Unnamed";
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={on}
              aria-label={`${name} shared ${itemName}`}
              onClick={() => setQuantity(p.id, on ? 0 : 1)}
              className={clsx(
                "inline-flex min-h-11 items-center gap-2 rounded-full border py-1 pr-3.5 pl-1 text-sm transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97]",
                on ? "border-ink bg-ink font-semibold text-paper" : "border-field-border bg-paper-raised font-medium text-ink-soft hover:border-ink hover:text-ink",
              )}
            >
              <Avatar name={p.name} color={p.color} size="sm" />
              <span className="max-w-[9rem] truncate">{name}</span>
              {on && quantity > 1 && <span className="font-mono text-label opacity-80">×{quantity}</span>}
              {on && quantity === 1 && <CheckIcon width={14} height={14} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {included.length > 0 && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            aria-expanded={portionsOpen}
            onClick={() => setPortionsOpen((v) => !v)}
            className="self-start rounded-lg py-1 text-sm font-medium text-ink-soft underline decoration-field-border underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            {portionsOpen ? "Hide portions" : "Someone had more? Adjust portions"}
          </button>
          {portionsOpen && (
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {included.map((p) => {
                const name = p.name.trim() || "Unnamed";
                return (
                  <li key={p.id} className="flex min-h-14 items-center gap-3 py-1.5 pr-1.5 pl-3">
                    <Avatar name={p.name} color={p.color} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{name}</span>
                    <Stepper value={quantityFor(p.id)} onChange={(v) => setQuantity(p.id, v)} min={0} ariaLabel={`Portions for ${name}`} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
