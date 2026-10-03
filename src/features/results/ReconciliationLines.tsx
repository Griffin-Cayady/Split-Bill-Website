import clsx from "clsx";
import { CheckIcon } from "../../components/ui/icons";
import { formatMoney } from "../../lib/currency";
import { chargeLabel, type BillReconciliation } from "../../lib/calc";
import type { Bill } from "../../lib/types";

function signed(amount: number, bill: Bill): string {
  return `${amount < 0 ? "−" : "+"} ${formatMoney(Math.abs(amount), bill.currency)}`;
}

/**
 * The receipt's own arithmetic, shown above the grand total: items, each
 * extra, and rounding sum exactly to what people pay, so the payer can check
 * it against the paper receipt at a glance.
 */
export function ReconciliationLines({ bill, rec }: { bill: Bill; rec: BillReconciliation }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-paper-raised">
      <div className="bg-accent px-5 pt-4 pb-5 text-accent-ink">
        <div className="text-sm font-medium opacity-85">Grand total</div>
        <div className="tabular-money mt-1 text-[2rem] leading-tight font-semibold tracking-tight">{formatMoney(rec.grandTotal, bill.currency)}</div>
      </div>

      <dl className="flex flex-col gap-2 px-5 pt-4 text-secondary">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Items</dt>
          <dd className="tabular-money text-ink">{formatMoney(rec.itemsTotal, bill.currency)}</dd>
        </div>
        {rec.unassigned > 0 && (
          <div className="flex justify-between gap-3 font-bold text-amber">
            <dt>Not assigned to anyone</dt>
            <dd className="tabular-money">− {formatMoney(rec.unassigned, bill.currency)}</dd>
          </div>
        )}
        {bill.charges.map((charge) => {
          const amount = rec.chargeAmounts.find((c) => c.chargeId === charge.id)?.amount ?? 0;
          return (
            <div key={charge.id} className={clsx("flex justify-between gap-3", amount < 0 ? "text-teal" : "text-ink-soft")}>
              <dt className="truncate">
                {chargeLabel(charge)}
                {charge.valueType === "percent" ? ` (${charge.value}%)` : ""}
              </dt>
              <dd className="tabular-money shrink-0">{signed(amount, bill)}</dd>
            </div>
          );
        })}
        {rec.roundingAdjustment !== 0 && (
          <div className="flex justify-between gap-3 text-ink-soft">
            <dt>Rounding</dt>
            <dd className="tabular-money">{signed(rec.roundingAdjustment, bill)}</dd>
          </div>
        )}
      </dl>

      {rec.unassigned === 0 && (
        <p className="mx-5 mt-4 flex items-center gap-2 border-t border-border pt-3 text-sm font-semibold text-teal">
          <CheckIcon width={16} height={16} aria-hidden="true" />
          Adds up — every item is fully split.
        </p>
      )}
      <div className="h-4" aria-hidden="true" />
    </div>
  );
}
