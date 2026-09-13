import { Pressable, Text, View } from "react-native";
import { STEPS, useUIStore, type Step } from "@shared/store/uiStore";

const STEP_LABELS: Record<Step, string> = { people: "People", items: "Items", charges: "Extras", results: "Totals" };

export function StepNav() {
  const step = useUIStore((s) => s.step);
  const setStep = useUIStore((s) => s.setStep);
  return (
    <View
      accessibilityRole="tablist"
      className="mx-4 my-4 flex-row overflow-hidden rounded-2xl border-[1.5px] border-border bg-paper-raised"
    >
      {STEPS.map((s, i) => {
        const active = s === step;
        return (
          <Pressable
            key={s}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => setStep(s)}
            className={`min-h-11 flex-1 flex-row items-center justify-center gap-1.5 px-1.5 py-1 ${active ? "bg-accent" : ""} ${
              i > 0 ? "border-l-[1.5px] border-border" : ""
            }`}
          >
            <View className={`h-6 w-6 items-center justify-center rounded-full ${active ? "bg-white/25" : "bg-paper-hover"}`}>
              <Text className={`font-sans-bold text-[13px] ${active ? "text-accent-ink" : "text-ink-soft"}`}>{i + 1}</Text>
            </View>
            <Text className={`font-sans-bold text-[13px] ${active ? "text-accent-ink" : "text-ink"}`}>{STEP_LABELS[s]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
