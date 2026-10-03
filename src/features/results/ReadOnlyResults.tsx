import { computeBillResult, reconcileBill } from "../../lib/calc";
import { PersonResultCard } from "./PersonResultCard";
import { ShareActions } from "./ShareActions";
import { EditACopyButton } from "./EditACopyButton";
import { ReconciliationLines } from "./ReconciliationLines";
import { settleUp, settleUpSentence } from "./settleUp";
import { formatBillDate } from "../../lib/date";
import type { Bill } from "../../lib/types";

export function ReadOnlyResults({ bill }: { bill: Bill }) {
  const result = computeBillResult(bill);
  const settle = settleUp(bill, result);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-5 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-display text-2xl font-extrabold tracking-tight text-ink">
          Split<span className="text-accent">Easy</span>
        </span>
        <span className="font-mono text-label tracking-[0.2em] text-ink-soft uppercase">shared result · read only</span>
      </header>

      <div>
        <h1 className="font-display text-headline font-extrabold text-ink">{bill.title}</h1>
        <p className="text-sm text-ink-soft">
          {formatBillDate(bill.dateISO)} {settleUpSentence(settle)}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {settle.ordered.map(({ person, result: r }) => (
          <PersonResultCard
            key={person.id}
            person={person}
            result={r}
            currency={bill.currency}
            payer={settle.payer}
            outstanding={settle.outstanding}
          />
        ))}
      </div>

      <ReconciliationLines bill={bill} rec={reconcileBill(bill, result)} />

      <div className="pt-1">
        <ShareActions bill={bill} />
      </div>

      <div className="pt-2">
        <EditACopyButton bill={bill} />
      </div>
    </div>
  );
}
