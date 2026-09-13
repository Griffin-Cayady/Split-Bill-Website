import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BOTTOM_BAR_HEIGHT } from "@/components/layout/StickyBottomBar";
import { useUndoStore } from "./undoStore";

/** Floats above the sticky bottom bar while a deleted item can still be restored. */
export function UndoSnackbar() {
  const pending = useUndoStore((s) => s.pending);
  const undo = useUndoStore((s) => s.undo);
  const insets = useSafeAreaInsets();
  if (!pending) return null;
  return (
    <View
      pointerEvents="box-none"
      style={{ bottom: insets.bottom + BOTTOM_BAR_HEIGHT + 16 }}
      className="absolute inset-x-0 items-center px-4"
    >
      <View style={{ backgroundColor: "#33291c" }} className="max-w-full flex-row items-center gap-3 rounded-full py-2 pl-5 pr-2 shadow-lg">
        <Text numberOfLines={1} style={{ color: "#fff8ec" }} className="shrink font-sans-semibold text-sm">
          Deleted "{pending.item.name || "item"}"
        </Text>
        <Pressable accessibilityRole="button" onPress={undo} className="rounded-full bg-accent px-4 py-2">
          <Text className="font-sans-bold text-sm text-accent-ink">Undo</Text>
        </Pressable>
      </View>
    </View>
  );
}
