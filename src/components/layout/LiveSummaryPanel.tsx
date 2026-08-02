import { useBillStore } from "../../store/billStore";
import { computeBillResult, itemNetTotal } from "../../lib/calc";
import { formatMoney } from "../../lib/currency";

export function LiveSummaryPanel() {
  const bill = useBillStore((s) => s.bill);
  const result = computeBillResult(bill);

  return (
    <div className="torn-edge-bottom sticky top-6 rounded-t border-[1.5px] border-b-0 border-border bg-paper-raised px-5 pt-5 pb-8 shadow-[0_10px_24px_rgba(51,41,28,0.08)]">
      <div className="mb-3 flex items-center justify-between border-b-[1.5px] border-dashed border-border pb-2.5">
        <h2 className="text-[13px] font-extrabold tracking-wide text-ink uppercase">Live receipt</h2>
        <span className="font-mono text-[13px] text-ink-soft">
          {bill.people.length} {bill.people.length === 1 ? "person" : "people"}
        </span>
      </div>

      <div className="pt-3">
        {bill.items.length === 0 ? (
          <p className="text-sm text-ink-soft">Add items to see the running total.</p>
        ) : (
          <ul className="space-y-1.5">
            {bill.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2 text-[15px]">
                <span className="truncate text-ink">
                  {item.name || "Untitled item"}
                  {item.quantity > 1 ? ` ×${item.quantity}` : ""}
                </span>
                <span className="tabular-money shrink-0 text-ink">{formatMoney(itemNetTotal(item), bill.currency)}</span>
              </li>
            ))}
          </ul>
        )}

        {bill.charges.length > 0 && (
          <ul className="mt-1.5 space-y-1.5">
            {bill.charges.map((c) => {
              const isDiscount = c.kind === "discount";
              return (
                <li key={c.id} className={"flex justify-between gap-2 text-[15px] " + (isDiscount ? "text-teal" : "text-ink-soft")}>
                  <span className="truncate">{c.label || "Charge"}</span>
                  <span className="tabular-money shrink-0">
                    {isDiscount ? "−" : "+"}
                    {c.valueType === "percent" ? `${c.value}%` : formatMoney(c.value, bill.currency)}
                  </span>
                </li>
              );
            })}
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
