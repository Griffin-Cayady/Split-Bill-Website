import { useState } from "react";
import clsx from "clsx";
import { Avatar } from "../../components/ui/Avatar";
import { formatMoney } from "../../lib/currency";
import type { Currency, Person, PersonResult } from "../../lib/types";

interface PersonResultCardProps {
  person: Person;
  result: PersonResult;
  currency: Currency;
  defaultOpen?: boolean;
  /** Omit to render read-only (e.g. a shared link view, which has no bill to persist the change to). */
  onTogglePaid?: (personId: string) => void;
}

export function PersonResultCard({ person, result, currency, defaultOpen, onTogglePaid }: PersonResultCardProps) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const settled = Boolean(person.paid);

  return (
    <div className="rounded-2xl border-[1.5px] border-border bg-paper-raised">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-14 w-full flex-wrap items-center gap-3.5 px-4 py-4 text-left"
      >
        <Avatar name={person.name} color={person.color} />
        <span className="text-[19px] font-extrabold text-ink">{person.name}</span>
        {settled && (
          <span className="rounded-full bg-teal-soft px-2.5 py-1 font-mono text-[11px] font-extrabold tracking-wide text-teal uppercase">
            Settled ✓
          </span>
        )}
        <span className="ml-auto font-mono text-xl font-semibold text-ink">{formatMoney(result.total, currency)}</span>
        <span className="text-sm text-ink-soft">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t-[1.5px] border-dashed border-border px-4.5 py-3.5 text-[15px]">
          {result.itemLines.length > 0 && (
            <ul className="space-y-1.5">
              {result.itemLines.map((line, i) => (
                <li key={i} className="flex justify-between gap-2 text-ink-soft">
                  <span className="truncate">{line.label}</span>
                  <span className="tabular-money shrink-0">{formatMoney(line.share, currency)}</span>
                </li>
              ))}
            </ul>
          )}

          {result.chargeLines.length > 0 && (
            <ul className={clsx("space-y-1.5", result.itemLines.length > 0 && "mt-2")}>
              {result.chargeLines.map((line, i) => {
                const negative = line.share < 0;
                return (
                  <li key={i} className={clsx("flex justify-between gap-2", negative ? "text-teal" : "text-ink-soft")}>
                    <span className="truncate">{line.label}</span>
                    <span className="tabular-money shrink-0">{formatMoney(Math.round(line.share), currency)}</span>
                  </li>
                );
              })}
            </ul>
          )}

          {onTogglePaid && (
            <button
              type="button"
              onClick={() => onTogglePaid(person.id)}
              className={clsx(
                "mt-3.5 min-h-11 rounded-xl border-[1.5px] px-4 text-sm font-bold transition-colors",
                settled ? "border-teal-border bg-teal-soft text-teal" : "border-border bg-transparent text-ink hover:bg-paper-hover",
              )}
            >
              {settled ? "Unsettled" : "Mark as settled"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
