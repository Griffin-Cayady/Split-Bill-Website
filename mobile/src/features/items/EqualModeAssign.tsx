import { Text, View } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Stepper } from "@/components/ui/Stepper";
import { useBillStore } from "@/store/billStore";
import type { Item } from "@shared/lib/types";

export function EqualModeAssign({ item }: { item: Item }) {
  const people = useBillStore((s) => s.bill.people);
  const updateItem = useBillStore((s) => s.updateItem);
  const ids = item.equalPersonIds ?? [];
  const quantities = item.equalQuantities ?? [];

  function quantityFor(personId: string): number {
    const explicit = quantities.find((q) => q.personId === personId)?.quantity;
    if (explicit !== undefined) return explicit;
    return ids.includes(personId) ? 1 : 0;
  }

  function setQuantity(personId: string, value: number) {
    const quantity = Math.max(0, Math.round(value));
    const nextQuantities = [...quantities.filter((q) => q.personId !== personId), ...(quantity > 0 ? [{ personId, quantity }] : [])];
    const nextIds = quantity > 0 ? (ids.includes(personId) ? ids : [...ids, personId]) : ids.filter((id) => id !== personId);
    updateItem(item.id, { equalPersonIds: nextIds, equalQuantities: nextQuantities });
  }

  if (people.length === 0) return <Text className="font-sans text-sm text-ink-soft">Add people first.</Text>;

  return (
    <View className="gap-2">
      {people.map((p) => {
        const quantity = quantityFor(p.id);
        const included = quantity > 0;
        return (
          <View key={p.id} className={`flex-row items-center gap-3 rounded-xl px-3 py-2 ${included ? "bg-paper" : ""}`}>
            <Avatar name={p.name} color={p.color} size="sm" />
            <Text numberOfLines={1} className={`flex-1 font-sans-bold text-base ${included ? "text-ink" : "text-ink-faint"}`}>
              {p.name}
            </Text>
            <Stepper value={quantity} onChange={(v) => setQuantity(p.id, v)} min={0} ariaLabel={`quantity for ${p.name}`} />
          </View>
        );
      })}
      <Text className="font-sans text-[13px] text-ink-faint">Set how many each person had — 0 leaves them out.</Text>
    </View>
  );
}
