import { Pressable, TextInput, View } from "react-native";
import { MinusIcon, PlusIcon } from "./icons";
import { useInkColor } from "./useInkColor";

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel: string;
}

const round2 = (v: number) => Math.round(v * 100) / 100;

export function Stepper({ value, onChange, min = 0, max = Infinity, step = 1, ariaLabel }: StepperProps) {
  const ink = useInkColor();
  const clamp = (v: number) => Math.min(max, Math.max(min, round2(v)));
  const btn = "h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-border";
  return (
    <View className="flex-row items-center gap-1.5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${ariaLabel}`}
        disabled={value <= min}
        onPress={() => onChange(clamp(value - step))}
        className={`${btn} ${value <= min ? "opacity-30" : ""}`}
      >
        <MinusIcon size={16} color={ink} />
      </Pressable>
      <TextInput
        accessibilityLabel={ariaLabel}
        keyboardType="decimal-pad"
        value={String(value)}
        onChangeText={(t) => {
          const v = Number.parseFloat(t);
          onChange(Number.isNaN(v) ? min : clamp(v));
        }}
        className="h-11 w-14 rounded-xl border-[1.5px] border-border bg-paper-raised text-center font-mono text-ink"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${ariaLabel}`}
        disabled={value >= max}
        onPress={() => onChange(clamp(value + step))}
        className={`${btn} ${value >= max ? "opacity-30" : ""}`}
      >
        <PlusIcon size={16} color={ink} />
      </Pressable>
    </View>
  );
}
