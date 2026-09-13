import { Pressable, Text, View } from "react-native";
import { CommitInput } from "@/components/ui/CommitInput";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TrashIcon } from "@/components/ui/icons";
import { useInkColor } from "@/components/ui/useInkColor";
import { useBillStore } from "@/store/billStore";
import { presetForSymbol } from "@shared/lib/currency";
import type { Charge } from "@shared/lib/types";

export function ChargeRow({ charge }: { charge: Charge }) {
  const currencySymbol = useBillStore((s) => s.bill.currency.symbol);
  const updateCharge = useBillStore((s) => s.updateCharge);
  const removeCharge = useBillStore((s) => s.removeCharge);
  const inkSoft = useInkColor("soft");
  const preset = presetForSymbol(currencySymbol);
  const isPercent = charge.valueType === "percent";
  const display = !charge.value ? "" : isPercent ? String(charge.value) : String(charge.value / 10 ** preset.decimalDigits);

  function commitValue(text: string) {
    const value = Number.parseFloat(text.replace(",", "."));
    if (Number.isNaN(value)) {
      updateCharge(charge.id, { value: 0 });
      return;
    }
    updateCharge(charge.id, { value: isPercent ? value : Math.round(value * 10 ** preset.decimalDigits) });
  }

  return (
    <View className="gap-2.5 rounded-2xl border-[1.5px] border-border bg-paper-raised p-3.5">
      <SegmentedControl
        accessibilityLabel="Charge or discount"
        options={[
          { value: "charge" as const, label: "Charge" },
          { value: "discount" as const, label: "Discount" },
        ]}
        value={charge.kind}
        onChange={(kind) => updateCharge(charge.id, { kind })}
      />

      <View className="flex-row items-center gap-2.5">
        <Input
          containerClassName="min-w-0 flex-1"
          accessibilityLabel="Charge label"
          placeholder="e.g. Tax"
          value={charge.label}
          onChangeText={(label) => updateCharge(charge.id, { label })}
          className="h-12 bg-paper font-sans-semibold text-base"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${charge.label || "charge"}`}
          onPress={() => removeCharge(charge.id)}
          className="h-11 w-11 items-center justify-center rounded-full"
        >
          <TrashIcon color={inkSoft} />
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2.5">
        <SegmentedControl
          accessibilityLabel="Percent or fixed amount"
          options={[
            { value: "percent" as const, label: "%" },
            { value: "fixed" as const, label: currencySymbol },
          ]}
          value={charge.valueType}
          onChange={(valueType) => updateCharge(charge.id, { valueType })}
        />
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          {!isPercent && <Text className="font-sans-bold text-sm text-ink-soft">{currencySymbol}</Text>}
          <CommitInput
            accessibilityLabel="Charge value"
            value={display}
            onCommit={commitValue}
            className="h-12 min-w-0 flex-1 rounded-xl border-[1.5px] border-border bg-paper px-2.5 text-right font-mono text-base text-ink"
          />
        </View>
      </View>
    </View>
  );
}
