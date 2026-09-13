import { View } from "react-native";
import { ItemForm } from "./ItemForm";
import { ItemDiscount } from "./ItemDiscount";
import { AssignmentModeControl } from "./AssignmentModeControl";
import { EqualModeAssign } from "./EqualModeAssign";
import { UnitsModeAssign } from "./UnitsModeAssign";
import type { Item } from "@shared/lib/types";

export function ItemRow({ item, onDelete }: { item: Item; onDelete: () => void }) {
  // Unknown modes (stale persisted data) fall back to equal-split instead of crashing.
  const ModeAssign = item.mode === "units" ? UnitsModeAssign : EqualModeAssign;
  return (
    <View className="gap-3.5 rounded-2xl border-[1.5px] border-border bg-paper-raised p-4">
      <ItemForm item={item} onDelete={onDelete} />
      {item.discount && <ItemDiscount item={item} />}
      <AssignmentModeControl item={item} />
      <ModeAssign item={item} />
    </View>
  );
}
