import { Pressable, Text, View } from "react-native";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  accessibilityLabel: string;
  className?: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, accessibilityLabel, className = "" }: Props<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className={`flex-row overflow-hidden rounded-xl border-[1.5px] border-border ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            onPress={() => onChange(opt.value)}
            className={`min-h-12 flex-1 items-center justify-center px-4 py-3 ${active ? "bg-accent" : "bg-paper-raised"}`}
          >
            <Text className={`font-sans-bold text-sm ${active ? "text-accent-ink" : "text-ink"}`}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
