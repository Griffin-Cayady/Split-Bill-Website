import { useBillStore } from "../../store/billStore";
import { computeBillResult, itemNetTotal, reconcileBill } from "../../lib/calc";
import { formatMoney } from "../../lib/currency";

export function LiveSummaryPanel() {
  const bill = useBillStore((s) => s.bill);
  const result = computeBillResult(bill);
  const rec = reconcileBill(bill, result);

  return (
    <div className="torn-edge-bottom sticky top-6 rounded-t border-[1.5px] border-b-0 border-border bg-paper-raised px-5 pt-5 pb-8 shadow-[0_10px_24px_rgba(51,41,28,0.08)]">
      <div className="mb-3 flex items-center justify-between border-b-[1.5px] border-dashed border-border pb-2.5">
        <h2 className="text-label font-extrabold tracking-wide text-ink uppercase">Live receipt</h2>
        <span className="font-mono text-label text-ink-soft">
          {bill.people.length} {bill.people.length === 1 ? "person" : "people"}
        </span>
      </div>

      <div className="pt-3">
        {bill.items.length === 0 ? (
          <p className="text-sm text-ink-soft">Add items to see the running total.</p>
        ) : (
          <ul className="space-y-1.5">
            {bill.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2 text-secondary">
                <span className="truncate text-ink">
                  {item.name.trim() || "Unnamed item"}
                  {item.quantity > 1 ? ` ×${item.quantity}` : ""}
                </span>
                <span className="tabular-money shrink-0 text-ink">{formatMoney(itemNetTotal(item), bill.currency)}</span>
              </li>
            ))}
          </ul>
        )}

        {(bill.charges.length > 0 || rec.unassigned > 0 || rec.roundingAdjustment !== 0) && (
          <ul className="mt-1.5 space-y-1.5">
            {rec.unassigned > 0 && (
              <li className="flex justify-between gap-2 text-secondary font-bold text-amber">
                <span className="truncate">Not assigned yet</span>
                <span className="tabular-money shrink-0">− {formatMoney(rec.unassigned, bill.currency)}</span>
              </li>
            )}
            {bill.charges.map((c) => {
              const amount = rec.chargeAmounts.find((a) => a.chargeId === c.id)?.amount ?? 0;
              return (
                <li key={c.id} className={"flex justify-between gap-2 text-secondary " + (amount < 0 ? "text-teal" : "text-ink-soft")}>
                  <span className="truncate">
                    {c.label.trim() || (c.kind === "discount" ? "Discount" : "Extra charge")}
                    {c.valueType === "percent" ? ` ${c.value}%` : ""}
                  </span>
                  <span className="tabular-money shrink-0">
                    {amount < 0 ? "−" : "+"} {formatMoney(Math.abs(amount), bill.currency)}
                  </span>
                </li>
              );
            })}
            {rec.roundingAdjustment !== 0 && (
              <li className="flex justify-between gap-2 text-secondary text-ink-soft">
                <span>Rounding</span>
                <span className="tabular-money shrink-0">
                  {rec.roundingAdjustment < 0 ? "−" : "+"} {formatMoney(Math.abs(rec.roundingAdjustment), bill.currency)}
                </span>
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="flex justify-between border-t-[1.5px] border-dashed border-border pt-3 text-lg font-extrabold text-ink">
        <span>Total</span>
        <span className="tabular-money">{formatMoney(result.grandTotal, bill.currency)}</span>
      </div>
    </div>
  );
}
