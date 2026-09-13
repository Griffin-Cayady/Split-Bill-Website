import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { useBillStore } from "@/store/billStore";
import { useStepGate } from "@shared/hooks/useStepGate";

/** Approximate bar height (without safe-area inset) so scroll content can pad past it. */
export const BOTTOM_BAR_HEIGHT = 68;

// The bar is intentionally always dark (same as the web), so it uses literal
// colors rather than theme tokens.
const BAR = { bg: "#33291c", line: "#5a4a34", text: "#fff8ec", hint: "#e0a030" };

export function StickyBottomBar() {
  const bill = useBillStore((s) => s.bill);
  const { isFirst, isLast, relevantBlock, goNext, goBack, hint } = useStepGate(bill);
  const insets = useSafeAreaInsets();
  if (isLast) return null;
  return (
    <View style={{ backgroundColor: BAR.bg, paddingBottom: insets.bottom }} className="absolute inset-x-0 bottom-0">
      {hint ? (
        <View style={{ borderColor: BAR.line }} className="border-b px-4 py-1.5">
          <Text style={{ color: BAR.hint }} className="text-center font-sans-semibold text-xs">
            {hint}
          </Text>
        </View>
      ) : null}
      <View className="flex-row items-center gap-2 px-4 py-3">
        {!isFirst && (
          <Pressable
            accessibilityRole="button"
            onPress={goBack}
            style={{ borderColor: BAR.line }}
            className="min-h-11 justify-center rounded-xl border-[1.5px] px-4"
          >
            <Text style={{ color: BAR.text }} className="font-sans-bold text-sm">
              Back
            </Text>
          </Pressable>
        )}
        <Button onPress={goNext} disabled={relevantBlock} className="ml-auto">
          Next
        </Button>
      </View>
    </View>
  );
}
