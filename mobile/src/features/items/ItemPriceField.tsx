import { Text, View } from "react-native";
import { CommitInput } from "@/components/ui/CommitInput";
import { useBillStore } from "@/store/billStore";
import { presetForSymbol } from "@shared/lib/currency";
import type { Item } from "@shared/lib/types";

export function ItemPriceField({ item, className = "" }: { item: Item; className?: string }) {
  const currency = useBillStore((s) => s.bill.currency);
  const updateItem = useBillStore((s) => s.updateItem);
  const preset = presetForSymbol(currency.symbol);
  const display = item.price ? String(item.price / 10 ** preset.decimalDigits) : "";

  function commit(text: string) {
    const value = Number.parseFloat(text.replace(",", "."));
    updateItem(item.id, { price: Number.isNaN(value) ? 0 : Math.round(value * 10 ** preset.decimalDigits) });
  }

  return (
    <View className={`min-w-0 flex-row items-center gap-1.5 ${className}`}>
      <Text className="font-sans-bold text-sm text-ink-soft">{currency.symbol}</Text>
      <CommitInput
        accessibilityLabel="Price"
        value={display}
        onCommit={commit}
        className="h-12 min-w-0 flex-1 rounded-xl border-[1.5px] border-border bg-paper px-2.5 text-right font-mono text-[17px] text-ink"
      />
    </View>
  );
}
