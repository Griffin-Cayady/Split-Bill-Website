import { Pressable, Text, View } from "react-native";
import { PlusIcon } from "@/components/ui/icons";
import { useInkColor } from "@/components/ui/useInkColor";
import { useBillStore } from "@/store/billStore";
import { computeBillResult } from "@shared/lib/calc";
import { formatMoney } from "@shared/lib/currency";
import type { Item } from "@shared/lib/types";
import { ItemRow } from "./ItemRow";
import { useUndoStore } from "./undoStore";

export function ItemsStep() {
  const bill = useBillStore((s) => s.bill);
  const addItem = useBillStore((s) => s.addItem);
  const removeItem = useBillStore((s) => s.removeItem);
  const schedule = useUndoStore((s) => s.schedule);
  const accent = useInkColor("accent");
  const items = bill.items;
  const billSubtotal = computeBillResult(bill).billSubtotal;

  function handleDelete(item: Item) {
    const index = items.findIndex((it) => it.id === item.id);
    removeItem(item.id);
    schedule(item, index);
  }

  return (
    <View className="gap-5">
      <View>
        <Text className="font-display-bold text-[30px] tracking-tight text-ink">What did you order?</Text>
        <Text className="mt-1.5 font-sans text-base text-ink-soft">Add each dish, then tap the people who shared it.</Text>
      </View>

      {items.length === 0 ? (
        <View className="rounded-2xl border-[1.5px] border-dashed border-border px-6 py-8">
          <Text className="text-center font-sans text-base text-ink-soft">No items yet — add the first one below.</Text>
        </View>
      ) : (
        <View className="gap-4">
          {items.map((item) => (
            <ItemRow key={item.id} item={item} onDelete={() => handleDelete(item)} />
          ))}
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => addItem()}
        className="min-h-[52px] w-full flex-row items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-accent bg-accent-soft px-6"
      >
        <PlusIcon size={18} color={accent} />
        <Text className="font-sans-bold text-base text-accent-hover">Add another item</Text>
      </Pressable>

      {items.length > 0 && (
        <View className="flex-row items-center justify-between rounded-2xl border-[1.5px] border-border bg-paper-raised px-4 py-3.5">
          <Text className="font-mono-bold text-xs uppercase tracking-wide text-ink-soft">Subtotal</Text>
          <Text className="font-mono-bold text-lg text-ink">{formatMoney(billSubtotal, bill.currency)}</Text>
        </View>
      )}
    </View>
  );
}
