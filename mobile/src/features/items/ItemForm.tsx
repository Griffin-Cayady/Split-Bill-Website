import { Pressable, View } from "react-native";
import { Input } from "@/components/ui/Input";
import { Stepper } from "@/components/ui/Stepper";
import { TrashIcon } from "@/components/ui/icons";
import { useInkColor } from "@/components/ui/useInkColor";
import { useBillStore } from "@/store/billStore";
import { ItemPriceField } from "./ItemPriceField";
import { ItemDiscount } from "./ItemDiscount";
import type { Item } from "@shared/lib/types";

/** Name + delete, then price + qty stepper, then the discount trigger (until a discount exists). */
export function ItemForm({ item, onDelete }: { item: Item; onDelete: () => void }) {
  const updateItem = useBillStore((s) => s.updateItem);
  const inkSoft = useInkColor("soft");
  return (
    <View className="gap-2.5">
      <View className="flex-row items-center gap-2.5">
        <Input
          containerClassName="min-w-0 flex-1"
          accessibilityLabel="Item name"
          placeholder="Item name"
          value={item.name}
          onChangeText={(name) => updateItem(item.id, { name })}
          className="h-12 bg-paper font-sans-semibold"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.name || "item"}`}
          onPress={onDelete}
          className="h-11 w-11 items-center justify-center rounded-full"
        >
          <TrashIcon color={inkSoft} />
        </Pressable>
      </View>
      <View className="flex-row items-center gap-2.5">
        <ItemPriceField item={item} className="flex-1" />
        <Stepper
          value={item.quantity}
          onChange={(v) => updateItem(item.id, { quantity: Math.max(1, Math.round(v)) })}
          min={1}
          ariaLabel="quantity"
        />
      </View>
      {!item.discount && <ItemDiscount item={item} compact />}
    </View>
  );
}
