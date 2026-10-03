import clsx from "clsx";
import { useBillStore } from "../../store/billStore";
import { computeBillResult, reconcileBill } from "../../lib/calc";
import { formatMoney } from "../../lib/currency";
import { useMediaQuery, isMobileQuery } from "../../hooks/useMediaQuery";
import { ChargeRow } from "./ChargeRow";
import { PlusIcon } from "../../components/ui/icons";

export function ChargesStep() {
  const bill = useBillStore((s) => s.bill);
  const addCharge = useBillStore((s) => s.addCharge);
  const result = computeBillResult(bill);
  const isMobile = useMediaQuery(isMobileQuery);

  const { chargeAmounts } = reconcileBill(bill, result);
  const chargeAmount = (chargeId: string) => chargeAmounts.find((c) => c.chargeId === chargeId)?.amount ?? 0;

  return (
    <div className="flex flex-col gap-5 pb-16">
      <div>
        <h1 className="font-display text-display font-extrabold tracking-tight text-ink">Tax, tip &amp; discounts</h1>
        <p className="mt-1.5 text-base text-ink-soft">Copy the extra lines from the bottom of your receipt — or skip this step. Each one is shared in proportion to what people ordered.</p>
      </div>

      {bill.charges.length === 0 ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-border px-6 py-8 text-center">
          <p className="text-base text-ink-soft">Nothing here yet — skip ahead if your receipt has no tax, service or tip.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bill.charges.map((charge) => (
            <ChargeRow key={charge.id} charge={charge} computedAmount={chargeAmount(charge.id)} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => addCharge({ label: "" })}
        className="min-h-[52px] w-full rounded-2xl border-[1.5px] border-dashed border-field-border px-6 text-base font-semibold text-ink transition-[background-color,border-color,transform] hover:border-ink hover:bg-paper-raised active:scale-[0.99] sm:w-auto sm:self-start"
      >
        <PlusIcon width={18} height={18} className="mr-1.5 inline align-text-bottom" />
        Add charge
      </button>

      {isMobile ? (
        <div className="flex flex-col gap-2 rounded-2xl border-[1.5px] border-border bg-paper-raised px-4 py-3.5 text-secondary">
          <div className="flex justify-between text-ink-soft">
            <span>Subtotal</span>
            <span className="tabular-money">{formatMoney(result.billSubtotal, bill.currency)}</span>
          </div>
          {bill.charges.map((charge) => {
            const negative = charge.kind === "discount";
            return (
              <div key={charge.id} className={clsx("flex justify-between gap-2", negative ? "text-teal" : "text-ink-soft")}>
                <span className="truncate">{charge.label || (negative ? "Discount" : "Charge")}</span>
                <span className="tabular-money shrink-0">
                  {negative ? "−" : "+"}
                  {formatMoney(Math.round(Math.abs(chargeAmount(charge.id))), bill.currency)}
                </span>
              </div>
            );
          })}
          <div className="flex justify-between border-t-[1.5px] border-dashed border-border pt-2 font-display text-xl font-extrabold text-ink">
            <span>Grand total</span>
            <span className="tabular-money">{formatMoney(result.grandTotal, bill.currency)}</span>
          </div>
        </div>
      ) : (
        <div className="flex justify-between border-t-2 border-ink pt-4 font-display text-xl font-extrabold text-ink">
          <span>Grand total</span>
          <span className="tabular-money">{formatMoney(result.grandTotal, bill.currency)}</span>
        </div>
      )}
    </div>
  );
}
