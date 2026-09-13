import { Text, View } from "react-native";

export function Header() {
  return (
    <View className="flex-row items-baseline gap-2.5 px-4 py-5">
      <Text className="font-display-bold text-[26px] tracking-tight text-ink">
        Split<Text className="text-accent">Easy</Text>
      </Text>
      <Text className="font-mono-bold text-[12px] uppercase tracking-[0.12em] text-ink-soft">split it fair</Text>
    </View>
  );
}
