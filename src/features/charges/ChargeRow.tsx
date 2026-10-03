import { fieldClass } from "../../components/ui/field";
import clsx from "clsx";
import { CommitInput } from "../../components/ui/CommitInput";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { TrashIcon } from "../../components/ui/icons";
import { useBillStore } from "../../store/billStore";
import { undoableBillChange } from "../../store/undoableBillChange";
import { formatMoney, presetForSymbol } from "../../lib/currency";
import { useMediaQuery, isMobileQuery } from "../../hooks/useMediaQuery";
import type { Charge } from "../../lib/types";

export function ChargeRow({ charge, computedAmount }: { charge: Charge; computedAmount: number }) {
  const currencySymbol = useBillStore((s) => s.bill.currency.symbol);
  const roundingUnit = useBillStore((s) => s.bill.currency.roundingUnit);
  const updateCharge = useBillStore((s) => s.updateCharge);
  const removeCharge = useBillStore((s) => s.removeCharge);
  const isMobile = useMediaQuery(isMobileQuery);

  const isDiscount = charge.kind === "discount";

  function remove() {
    undoableBillChange(`Removed ${charge.label.trim() || (isDiscount ? "discount" : "charge")}`, () => removeCharge(charge.id));
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-paper-raised p-4 shadow-card sm:p-5">
      {isMobile ? (
        <div className="flex flex-col gap-2.5">
          <SegmentedControl
            aria-label="Charge or discount"
            options={[
              { value: "charge" as const, label: "Charge" },
              { value: "discount" as const, label: "Discount" },
            ]}
            value={charge.kind}
            onChange={(kind) => updateCharge(charge.id, { kind })}
          />

          <div className="flex items-center gap-2.5">
            <input
              value={charge.label}
              onChange={(e) => updateCharge(charge.id, { label: e.target.value })}
              placeholder="e.g. Tax"
              aria-label="Charge label"
              className={labelFieldClass}
            />
            <button
              type="button"
              aria-label={`Delete ${charge.label || "charge"}`}
              onClick={remove}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-paper-hover hover:text-danger"
            >
              <TrashIcon />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <SegmentedControl
              aria-label="Percent or fixed amount"
              options={[
                { value: "percent" as const, label: "%" },
                { value: "fixed" as const, label: currencySymbol },
              ]}
              value={charge.valueType}
              onChange={(valueType) => updateCharge(charge.id, { valueType })}
            />
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              {charge.valueType === "fixed" && <span className="text-sm font-bold text-ink-soft">{currencySymbol}</span>}
              <ChargeValueField charge={charge} currencySymbol={currencySymbol} className="h-12 min-w-0 flex-1 text-base" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              value={charge.label}
              onChange={(e) => updateCharge(charge.id, { label: e.target.value })}
              placeholder="e.g. Tax"
              aria-label="Charge label"
              className={labelFieldClass}
            />
            <span className={clsx("shrink-0 pl-2 font-mono text-body-lg font-semibold tabular-nums", isDiscount ? "text-teal" : "text-ink")}>
              {isDiscount ? "−" : "+"}
              {formatMoney(Math.round(Math.abs(computedAmount)), { symbol: currencySymbol, roundingUnit })}
            </span>
            <button
              type="button"
              aria-label={`Delete ${charge.label || "charge"}`}
              onClick={remove}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-paper-hover hover:text-danger"
            >
              <TrashIcon />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
          <SegmentedControl
            aria-label="Charge or discount"
            options={[
              { value: "charge" as const, label: "Charge" },
              { value: "discount" as const, label: "Discount" },
            ]}
            value={charge.kind}
            onChange={(kind) => updateCharge(charge.id, { kind })}
          />

          <SegmentedControl
            aria-label="Percent or fixed amount"
            options={[
              { value: "percent" as const, label: "%" },
              { value: "fixed" as const, label: currencySymbol },
            ]}
            value={charge.valueType}
            onChange={(valueType) => updateCharge(charge.id, { valueType })}
          />

          <div className="flex items-center gap-1.5">
            {charge.valueType === "fixed" && <span className="text-sm font-semibold text-ink-soft">{currencySymbol}</span>}
            <ChargeValueField charge={charge} currencySymbol={currencySymbol} className="h-12 w-28" />
            {charge.valueType === "percent" && <span className="text-sm font-semibold text-ink-soft">%</span>}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChargeValueField({ charge, currencySymbol, className }: { charge: Charge; currencySymbol: string; className?: string }) {
  const updateCharge = useBillStore((s) => s.updateCharge);
  const preset = presetForSymbol(currencySymbol);
  const isPercent = charge.valueType === "percent";

  const display = isPercent
    ? charge.value
      ? String(charge.value)
      : ""
    : charge.value
      ? String(charge.value / 10 ** preset.decimalDigits)
      : "";

  function commit(text: string) {
    const value = Number.parseFloat(text.replace(",", "."));
    if (Number.isNaN(value)) {
      updateCharge(charge.id, { value: 0 });
      return;
    }
    updateCharge(charge.id, { value: isPercent ? value : Math.round(value * 10 ** preset.decimalDigits) });
  }

  return (
    <CommitInput
      value={display}
      onCommit={commit}
      aria-label="Charge value"
      className={clsx(
        fieldClass, "px-2.5 text-right font-mono tabular-nums",
        className,
      )}
    />
  );
}

const labelFieldClass =
  clsx(fieldClass, "h-11 min-w-0 flex-1 px-3 text-body-lg font-semibold");
