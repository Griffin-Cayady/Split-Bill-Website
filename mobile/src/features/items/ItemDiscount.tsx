import { Pressable, Text, View } from "react-native";
import { useColorScheme } from "nativewind";
import { CommitInput } from "@/components/ui/CommitInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PlusIcon, XIcon } from "@/components/ui/icons";
import { useBillStore } from "@/store/billStore";
import { itemDiscountAmount, itemNetTotal } from "@shared/lib/calc";
import { formatMoney, presetForSymbol } from "@shared/lib/currency";
import type { Item } from "@shared/lib/types";

const TEAL = { light: "#2e7d4f", dark: "#6fbe8f" };

/** compact = the small trigger shown inline in ItemForm when no discount exists yet. */
export function ItemDiscount({ item, compact }: { item: Item; compact?: boolean }) {
  const currency = useBillStore((s) => s.bill.currency);
  const updateItem = useBillStore((s) => s.updateItem);
  const { colorScheme } = useColorScheme();
  const teal = colorScheme === "dark" ? TEAL.dark : TEAL.light;
  const preset = presetForSymbol(currency.symbol);

  if (!item.discount) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => updateItem(item.id, { discount: { valueType: "percent", value: 0 } })}
        className={`min-h-11 flex-row items-center gap-1.5 self-start rounded-xl border-[1.5px] border-teal-border bg-teal-soft ${
          compact ? "px-3" : "px-4"
        }`}
      >
        <PlusIcon size={16} color={teal} />
        <Text className={`font-sans-bold text-teal ${compact ? "text-xs" : "text-sm"}`}>
          {compact ? "Discount" : "Add discount for this item"}
        </Text>
      </Pressable>
    );
  }

  const discount = item.discount;
  const isPercent = discount.valueType === "percent";
  const display = !discount.value ? "" : isPercent ? String(discount.value) : String(discount.value / 10 ** preset.decimalDigits);

  function commit(text: string) {
    const value = Number.parseFloat(text.replace(",", "."));
    if (Number.isNaN(value)) {
      updateItem(item.id, { discount: { ...discount, value: 0 } });
      return;
    }
    updateItem(item.id, { discount: { ...discount, value: isPercent ? value : Math.round(value * 10 ** preset.decimalDigits) } });
  }

  return (
    <View className="gap-3 rounded-xl border-[1.5px] border-teal-border bg-teal-soft px-3.5 py-3.5">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="font-sans-bold text-sm text-teal">Discount on this item</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove item discount"
          onPress={() => updateItem(item.id, { discount: undefined })}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <XIcon size={16} color={teal} />
        </Pressable>
      </View>
      <View className="flex-row items-center gap-2.5">
        <SegmentedControl
          accessibilityLabel="Discount percent or fixed amount"
          options={[
            { value: "percent" as const, label: "%" },
            { value: "fixed" as const, label: currency.symbol },
          ]}
          value={discount.valueType}
          onChange={(valueType) => updateItem(item.id, { discount: { ...discount, valueType } })}
        />
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          {!isPercent && <Text className="font-sans-bold text-sm text-teal">{currency.symbol}</Text>}
          <CommitInput
            accessibilityLabel="Discount value"
            value={display}
            onCommit={commit}
            className="h-12 min-w-0 flex-1 rounded-lg border-[1.5px] border-teal-border bg-paper-raised px-2 text-right font-mono text-base text-teal"
          />
        </View>
      </View>
      {discount.value > 0 && (
        <Text className="text-right font-mono text-xs text-teal">
          −{formatMoney(itemDiscountAmount(item), currency)} → {formatMoney(itemNetTotal(item), currency)}
        </Text>
      )}
    </View>
  );
}
