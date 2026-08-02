import { computeBillResult } from "../../lib/calc";
import { formatMoney } from "../../lib/currency";
import { PersonResultCard } from "./PersonResultCard";
import { ShareActions } from "./ShareActions";
import { EditACopyButton } from "./EditACopyButton";
import type { Bill } from "../../lib/types";

export function ReadOnlyResults({ bill }: { bill: Bill }) {
  const result = computeBillResult(bill);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-5 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-display text-2xl font-extrabold tracking-tight text-ink">
          Split<span className="text-accent">Easy</span>
        </span>
        <span className="font-mono text-[11px] tracking-[0.2em] text-ink-soft uppercase">shared result · read only</span>
      </header>

      <div>
        <h1 className="font-display text-[26px] font-extrabold text-ink">{bill.title}</h1>
        <p className="text-sm text-ink-soft">{bill.dateISO}</p>
      </div>

      <div className="flex flex-col gap-3">
        {result.perPerson.map((p) => {
          const person = bill.people.find((person) => person.id === p.personId);
          if (!person) return null;
          return (
            <PersonResultCard key={p.personId} person={person} result={p} currency={bill.currency} />
          );
        })}
      </div>

      <div className="flex justify-between border-t-2 border-ink pt-4 font-display text-xl font-extrabold text-ink">
        <span>Grand total</span>
        <span className="tabular-money">{formatMoney(result.grandTotal, bill.currency)}</span>
      </div>

      <div className="pt-1">
        <ShareActions bill={bill} />
      </div>

      <div className="pt-2">
        <EditACopyButton bill={bill} />
      </div>
    </div>
  );
}
