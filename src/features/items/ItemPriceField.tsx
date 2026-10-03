import clsx from "clsx";
import { CommitInput } from "../../components/ui/CommitInput";
import { useBillStore } from "../../store/billStore";
import { presetForSymbol } from "../../lib/currency";
import type { Item } from "../../lib/types";

export function ItemPriceField({ item, className }: { item: Item; className?: string }) {
  const currency = useBillStore((s) => s.bill.currency);
  const updateItem = useBillStore((s) => s.updateItem);
  const preset = presetForSymbol(currency.symbol);

  const display = item.price ? String(item.price / 10 ** preset.decimalDigits) : "";

  function commitPrice(text: string) {
    const value = Number.parseFloat(text.replace(",", "."));
    updateItem(item.id, { price: Number.isNaN(value) ? 0 : Math.round(value * 10 ** preset.decimalDigits) });
  }

  return (
    <div className={clsx("flex min-w-0 items-center gap-1.5", className)}>
      <span className="text-sm font-bold text-ink-soft">{currency.symbol}</span>
      <CommitInput
        value={display}
        onCommit={commitPrice}
        aria-label="Price"
        className="h-12 min-w-0 flex-1 rounded-xl border-[1.5px] border-field-border bg-paper px-2.5 text-right font-mono text-body-lg tabular-nums text-ink focus:border-accent focus:ring-2 focus:ring-accent/60 focus:outline-none"
      />
    </div>
  );
}
