import { Pressable, Text, View } from "react-native";
import { PlusIcon } from "@/components/ui/icons";
import { useInkColor } from "@/components/ui/useInkColor";
import { useBillStore } from "@/store/billStore";
import { computeBillResult } from "@shared/lib/calc";
import { formatMoney } from "@shared/lib/currency";
import { ChargeRow } from "./ChargeRow";

export function ChargesStep() {
  const bill = useBillStore((s) => s.bill);
  const addCharge = useBillStore((s) => s.addCharge);
  const accent = useInkColor("accent");
  const result = computeBillResult(bill);

  function chargeAmount(chargeId: string): number {
    let total = 0;
    for (const p of result.perPerson) {
      for (const line of p.chargeLines) {
        if (line.chargeId === chargeId) total += line.share;
      }
    }
    return total;
  }

  return (
    <View className="gap-5">
      <View>
        <Text className="font-display-bold text-[30px] tracking-tight text-ink">Tax, tip & discounts</Text>
        <Text className="mt-1.5 font-sans text-base text-ink-soft">
          Copy the extra lines from the bottom of your receipt — or skip this step.
        </Text>
      </View>

      {bill.charges.length === 0 ? (
        <View className="rounded-2xl border-[1.5px] border-dashed border-border px-6 py-8">
          <Text className="text-center font-sans text-base text-ink-soft">
            No extras — that is fine. Use the button below if your receipt has tax or a tip.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {bill.charges.map((charge) => (
            <ChargeRow key={charge.id} charge={charge} />
          ))}
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => addCharge({ label: "" })}
        className="min-h-[52px] w-full flex-row items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-accent bg-accent-soft px-6"
      >
        <PlusIcon size={18} color={accent} />
        <Text className="font-sans-bold text-base text-accent-hover">Add charge</Text>
      </Pressable>

      <View className="gap-2 rounded-2xl border-[1.5px] border-border bg-paper-raised px-4 py-3.5">
        <View className="flex-row justify-between">
          <Text className="font-sans text-[15px] text-ink-soft">Subtotal</Text>
          <Text className="font-mono text-[15px] text-ink-soft">{formatMoney(result.billSubtotal, bill.currency)}</Text>
        </View>
        {bill.charges.map((charge) => {
          const negative = charge.kind === "discount";
          const tone = negative ? "text-teal" : "text-ink-soft";
          return (
            <View key={charge.id} className="flex-row justify-between gap-2">
              <Text numberOfLines={1} className={`shrink font-sans text-[15px] ${tone}`}>
                {charge.label || (negative ? "Discount" : "Charge")}
              </Text>
              <Text className={`font-mono text-[15px] ${tone}`}>
                {negative ? "−" : "+"}
                {formatMoney(Math.round(Math.abs(chargeAmount(charge.id))), bill.currency)}
              </Text>
            </View>
          );
        })}
        <View className="flex-row justify-between border-t-[1.5px] border-dashed border-border pt-2">
          <Text className="font-display-bold text-xl text-ink">Grand total</Text>
          <Text className="font-mono-bold text-xl text-ink">{formatMoney(result.grandTotal, bill.currency)}</Text>
        </View>
      </View>
    </View>
  );
}
