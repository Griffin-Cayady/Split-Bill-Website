import clsx from "clsx";
import { CommitInput } from "../../components/ui/CommitInput";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { PlusIcon, XIcon } from "../../components/ui/icons";
import { useBillStore } from "../../store/billStore";
import { itemDiscountAmount, itemNetTotal } from "../../lib/calc";
import { formatMoney, presetForSymbol } from "../../lib/currency";
import { useMediaQuery, isMobileQuery } from "../../hooks/useMediaQuery";
import type { Item, ItemDiscount as ItemDiscountValue } from "../../lib/types";

export function ItemDiscount({ item, compact }: { item: Item; compact?: boolean }) {
  const currency = useBillStore((s) => s.bill.currency);
  const updateItem = useBillStore((s) => s.updateItem);
  const isMobile = useMediaQuery(isMobileQuery);

  if (!item.discount) {
    return (
      <button
        type="button"
        onClick={() => updateItem(item.id, { discount: { valueType: "percent", value: 0 } })}
        className={clsx(
          "flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg font-semibold text-teal transition-colors hover:bg-teal-soft",
          compact ? "px-2 text-sm" : "-ml-2 self-start px-2 text-sm",
        )}
      >
        <PlusIcon width={16} height={16} />
        {compact ? "Discount" : "Add a discount"}
      </button>
    );
  }

  const discount = item.discount;
  const summary = discount.value > 0 && (
    <span className="font-mono text-label text-teal">
      −{formatMoney(itemDiscountAmount(item), currency)} → {formatMoney(itemNetTotal(item), currency)}
    </span>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-teal-border bg-teal-soft px-3.5 py-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-teal">Discount on this item</span>
          <button
            type="button"
            aria-label="Remove item discount"
            onClick={() => updateItem(item.id, { discount: undefined })}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-teal hover:bg-black/5"
          >
            <XIcon width={16} height={16} />
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          <SegmentedControl
            aria-label="Discount percent or fixed amount"
            options={[
              { value: "percent" as const, label: "%" },
              { value: "fixed" as const, label: currency.symbol },
            ]}
            value={discount.valueType}
            onChange={(valueType) => updateItem(item.id, { discount: { ...discount, valueType } })}
          />
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            {discount.valueType === "fixed" && <span className="text-sm font-bold text-teal">{currency.symbol}</span>}
            <DiscountValueField item={item} discount={discount} currencySymbol={currency.symbol} className="h-12 min-w-0 flex-1 text-base" />
          </div>
        </div>
        {summary && <div className="text-right">{summary}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-teal-border bg-teal-soft px-3.5 py-3">
      <span className="text-sm font-bold text-teal">Discount on this item</span>
      <SegmentedControl
        aria-label="Discount percent or fixed amount"
        options={[
          { value: "percent" as const, label: "%" },
          { value: "fixed" as const, label: currency.symbol },
        ]}
        value={discount.valueType}
        onChange={(valueType) => updateItem(item.id, { discount: { ...discount, valueType } })}
      />
      <DiscountValueField item={item} discount={discount} currencySymbol={currency.symbol} className="h-10 min-w-0 flex-1" />
      {summary}
      <button
        type="button"
        aria-label="Remove item discount"
        onClick={() => updateItem(item.id, { discount: undefined })}
        className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-teal hover:bg-black/5"
      >
        <XIcon width={16} height={16} />
      </button>
    </div>
  );
}

function DiscountValueField({
  item,
  discount,
  currencySymbol,
  className,
}: {
  item: Item;
  discount: ItemDiscountValue;
  currencySymbol: string;
  className?: string;
}) {
  const updateItem = useBillStore((s) => s.updateItem);
  const preset = presetForSymbol(currencySymbol);
  const isPercent = discount.valueType === "percent";

  const display = isPercent
    ? discount.value
      ? String(discount.value)
      : ""
    : discount.value
      ? String(discount.value / 10 ** preset.decimalDigits)
      : "";

  function commit(text: string) {
    const value = Number.parseFloat(text.replace(",", "."));
    if (Number.isNaN(value)) {
      updateItem(item.id, { discount: { ...discount, value: 0 } });
      return;
    }
    updateItem(item.id, { discount: { ...discount, value: isPercent ? value : Math.round(value * 10 ** preset.decimalDigits) } });
  }

  return (
    <CommitInput
      value={display}
      onCommit={commit}
      aria-label="Discount value"
      className={clsx(
        "rounded-lg border border-teal-border bg-paper-raised px-2 text-right font-mono tabular-nums text-teal focus:border-teal focus:ring-2 focus:ring-teal/60 focus:outline-none",
        className,
      )}
    />
  );
}
