import { Pressable, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { useBillStore } from "@/store/billStore";
import { computeBillResult, validateBill } from "@shared/lib/calc";
import { formatMoney } from "@shared/lib/currency";
import { useUIStore } from "@shared/store/uiStore";
import { PersonResultCard } from "./PersonResultCard";
import { ShareActions } from "./ShareActions";

export function ResultsStep() {
  const bill = useBillStore((s) => s.bill);
  const togglePersonPaid = useBillStore((s) => s.togglePersonPaid);
  const setStep = useUIStore((s) => s.setStep);

  if (bill.people.length === 0 || bill.items.length === 0) {
    return (
      <View className="items-center gap-4 rounded-2xl border-[1.5px] border-dashed border-border px-6 py-8">
        <Text className="text-center font-sans text-base text-ink-soft">Add people and items first to see who owes what.</Text>
        <Button variant="secondary" onPress={() => setStep("people")}>
          Back to People
        </Button>
      </View>
    );
  }

  const result = computeBillResult(bill);
  const validation = validateBill(bill);
  const payerId = bill.payerId ?? bill.people[0]?.id;
  const nonPayers = bill.people.filter((p) => p.id !== payerId);
  const settledCount = nonPayers.filter((p) => p.paid).length;
  const settledText = nonPayers.length > 0 ? ` ${settledCount} of ${nonPayers.length} people have settled up.` : "";

  return (
    <View className="gap-5">
      <View>
        <Text className="font-display-bold text-[30px] tracking-tight text-ink">Who owes what</Text>
        <Text className="mt-1.5 font-sans text-base text-ink-soft">Tap a card to see the full breakdown.{settledText}</Text>
      </View>

      {!validation.valid && (
        <View className="flex-row flex-wrap items-center gap-1 rounded-xl border-[1.5px] border-accent bg-accent-soft px-3.5 py-2.5">
          <Text className="font-sans-semibold text-sm text-accent-hover">Some items still need attention before this total is final.</Text>
          <Pressable accessibilityRole="button" onPress={() => setStep("items")}>
            <Text className="font-sans-bold text-sm text-accent-hover underline">Review items</Text>
          </Pressable>
        </View>
      )}

      <View className="gap-3">
        {result.perPerson.map((p) => {
          const person = bill.people.find((x) => x.id === p.personId);
          if (!person) return null;
          return <PersonResultCard key={p.personId} person={person} result={p} currency={bill.currency} onTogglePaid={togglePersonPaid} />;
        })}
      </View>

      <View className="flex-row justify-between border-t-2 border-ink pt-4">
        <Text className="font-display-bold text-2xl text-ink">Grand total</Text>
        <Text className="font-mono-bold text-2xl text-ink">{formatMoney(result.grandTotal, bill.currency)}</Text>
      </View>

      <ShareActions bill={bill} />
    </View>
  );
}
