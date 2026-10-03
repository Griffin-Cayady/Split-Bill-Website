import clsx from "clsx";
import { useBillStore } from "../../store/billStore";
import { chargeLabel, computeBillResult, itemNetTotal, reconcileBill } from "../../lib/calc";
import { formatMoney } from "../../lib/currency";

/**
 * Desktop sidebar: the running total on the one accent surface in the app,
 * with the lines that make it up listed underneath.
 */
export function LiveSummaryPanel() {
  const bill = useBillStore((s) => s.bill);
  const result = computeBillResult(bill);
  const rec = reconcileBill(bill, result);
  const peopleCount = bill.people.length;

  return (
    <div className="sticky top-6 overflow-hidden rounded-xl border border-border bg-paper-raised">
      <div className="bg-accent px-5 pt-4 pb-5 text-accent-ink" aria-live="polite">
        <div className="flex items-baseline justify-between gap-3 text-sm font-medium opacity-85">
          <h2>Total</h2>
          <span>
            {peopleCount} {peopleCount === 1 ? "person" : "people"}
          </span>
        </div>
        <div className="tabular-money mt-1 truncate text-[2rem] leading-tight font-semibold tracking-tight">
          {formatMoney(result.grandTotal, bill.currency)}
        </div>
      </div>

      <div className="px-5 py-4">
        {bill.items.length === 0 ? (
          <p className="text-sm text-ink-soft">Items you add will be listed here.</p>
        ) : (
          <ul className="space-y-2">
            {bill.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 text-secondary">
                <span className="truncate text-ink">
                  {item.name.trim() || "Unnamed item"}
                  {item.quantity > 1 && <span className="text-ink-soft"> ×{item.quantity}</span>}
                </span>
                <span className="tabular-money shrink-0 text-ink">{formatMoney(itemNetTotal(item), bill.currency)}</span>
              </li>
            ))}
          </ul>
        )}

        {(bill.charges.length > 0 || rec.unassigned > 0 || rec.roundingAdjustment !== 0) && (
          <ul className="mt-3 space-y-2 border-t border-border pt-3">
            {rec.unassigned > 0 && (
              <li className="flex justify-between gap-3 text-secondary font-semibold text-amber">
                <span className="truncate">Not assigned yet</span>
                <span className="tabular-money shrink-0">−{formatMoney(rec.unassigned, bill.currency)}</span>
              </li>
            )}
            {bill.charges.map((c) => {
              const amount = rec.chargeAmounts.find((a) => a.chargeId === c.id)?.amount ?? 0;
              return (
                <li key={c.id} className={clsx("flex justify-between gap-3 text-secondary", amount < 0 ? "text-teal" : "text-ink-soft")}>
                  <span className="truncate">
                    {chargeLabel(c)}
                    {c.valueType === "percent" ? ` ${c.value}%` : ""}
                  </span>
                  <span className="tabular-money shrink-0">
                    {amount < 0 ? "−" : "+"}
                    {formatMoney(Math.abs(amount), bill.currency)}
                  </span>
                </li>
              );
            })}
            {rec.roundingAdjustment !== 0 && (
              <li className="flex justify-between gap-3 text-secondary text-ink-soft">
                <span>Rounding</span>
                <span className="tabular-money shrink-0">
                  {rec.roundingAdjustment < 0 ? "−" : "+"}
                  {formatMoney(Math.abs(rec.roundingAdjustment), bill.currency)}
                </span>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
