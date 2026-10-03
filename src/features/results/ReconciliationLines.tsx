import clsx from "clsx";
import { CheckIcon } from "../../components/ui/icons";
import { formatMoney } from "../../lib/currency";
import type { BillReconciliation } from "../../lib/calc";
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
    <div className="flex flex-col gap-2.5">
      <dl className="flex flex-col gap-1.5 text-secondary">
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
                {charge.label.trim() || (charge.kind === "discount" ? "Discount" : "Extra charge")}
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

      <div className="flex justify-between border-t-2 border-ink pt-4 font-display text-2xl font-extrabold text-ink">
        <span>Grand total</span>
        <span className="tabular-money">{formatMoney(rec.grandTotal, bill.currency)}</span>
      </div>

      {rec.unassigned === 0 && (
        <p className="flex items-center gap-2 text-sm font-bold text-teal">
          <CheckIcon width={16} height={16} aria-hidden="true" />
          Adds up — every item is fully split.
        </p>
      )}
    </div>
  );
}
