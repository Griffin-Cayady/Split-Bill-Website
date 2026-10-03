import { useState } from "react";
import clsx from "clsx";
import { Avatar } from "../../components/ui/Avatar";
import { CheckIcon } from "../../components/ui/icons";
import { formatMoney } from "../../lib/currency";
import type { Currency, Person, PersonResult } from "../../lib/types";

interface PersonResultCardProps {
  person: Person;
  result: PersonResult;
  currency: Currency;
  defaultOpen?: boolean;
  /** Who paid the bill; omitted when nobody is set. */
  payer?: Person;
  /** For the payer's own card: what the others still owe them. */
  outstanding?: number;
  /** Omit to render read-only (e.g. a shared link view, which has no bill to persist the change to). */
  onTogglePaid?: (personId: string) => void;
}

export function PersonResultCard({ person, result, currency, defaultOpen, payer, outstanding = 0, onTogglePaid }: PersonResultCardProps) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const isPayer = payer?.id === person.id;
  const settled = !isPayer && Boolean(person.paid);
  const payerName = payer?.name.trim() || "the payer";

  let relation: string | null = null;
  if (isPayer) {
    relation = outstanding > 0 ? `paid the bill · gets back ${formatMoney(outstanding, currency)}` : "paid the bill · all settled";
  } else if (payer && result.total <= 0) {
    relation = "owes nothing";
  } else if (payer) {
    relation = settled ? `paid ${payerName} back` : `owes ${payerName}`;
  }

  return (
    <div className="rounded-xl border border-border bg-paper-raised shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-14 w-full items-center gap-3.5 rounded-xl px-4 py-4 text-left transition-colors hover:bg-paper-hover/60"
      >
        <Avatar name={person.name} color={person.color} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-display text-title font-bold tracking-tight text-ink">{person.name.trim() || "Unnamed"}</span>
          {relation && (
            <span className={clsx("flex items-center gap-1 text-sm font-semibold", settled ? "text-teal" : "text-ink-soft")}>
              {settled && <CheckIcon width={14} height={14} aria-hidden="true" />}
              {relation}
            </span>
          )}
        </span>
        <span className={clsx("tabular-money text-xl font-semibold", settled ? "text-ink-soft line-through decoration-1" : "text-ink")}>
          {formatMoney(result.total, currency)}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={clsx("shrink-0 text-ink-soft transition-transform duration-200", open && "rotate-180")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-border px-4.5 py-3.5 text-secondary">
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

          {onTogglePaid && payer && !isPayer && result.total > 0 && (
            <button
              type="button"
              onClick={() => onTogglePaid(person.id)}
              className={clsx(
                "mt-3.5 min-h-11 rounded-lg border px-4 text-sm font-semibold transition-[color,background-color,transform] active:scale-[0.97]",
                settled ? "border-teal-border bg-teal-soft text-teal" : "border-border bg-transparent text-ink hover:bg-paper-hover",
              )}
            >
              {settled ? `Undo — ${person.name.trim() || "they"} hasn't paid yet` : `Mark as paid back to ${payerName}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
