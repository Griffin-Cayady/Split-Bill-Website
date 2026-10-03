import { useRef, type KeyboardEvent } from "react";
import clsx from "clsx";
import { Avatar } from "../../components/ui/Avatar";
import { useBillStore } from "../../store/billStore";
import type { Person } from "../../lib/types";

/** "Who paid?" — a single-choice radio group; everyone else settles up with this person. */
export function PayerPicker({ people, payerId }: { people: Person[]; payerId: string }) {
  const setPayer = useBillStore((s) => s.setPayer);
  const groupRef = useRef<HTMLDivElement>(null);

  // Arrow keys move the selection, as in a native radio group.
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const index = people.findIndex((p) => p.id === payerId);
    const next = people[(index + delta + people.length) % people.length];
    setPayer(next.id);
    groupRef.current?.querySelector<HTMLButtonElement>(`[data-person="${next.id}"]`)?.focus();
  }

  return (
    <div className="flex flex-col gap-2.5">
      <h2 id="payer-heading" className="font-display text-title font-bold tracking-tight text-ink">
        Who paid the bill?
      </h2>
      <div ref={groupRef} role="radiogroup" aria-labelledby="payer-heading" onKeyDown={onKeyDown} className="flex flex-wrap gap-2">
        {people.map((p) => {
          const selected = p.id === payerId;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              data-person={p.id}
              onClick={() => setPayer(p.id)}
              className={clsx(
                "flex min-h-11 items-center gap-2 rounded-full border py-1 pr-4 pl-1 text-secondary font-semibold transition-[color,background-color,transform] active:scale-[0.97]",
                selected ? "border-ink bg-ink text-paper" : "border-border bg-paper-raised text-ink hover:bg-paper-hover",
              )}
            >
              <Avatar name={p.name} color={p.color} size="sm" />
              {p.name.trim() || "Unnamed"}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-ink-soft">Everyone else will see how much they owe this person.</p>
    </div>
  );
}
