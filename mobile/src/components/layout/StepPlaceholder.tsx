import { Text, View } from "react-native";

export function StepPlaceholder({ name }: { name: string }) {
  return (
    <View className="rounded-2xl border-[1.5px] border-dashed border-border px-6 py-10">
      <Text className="text-center font-display-bold text-xl text-ink">{name}</Text>
      <Text className="mt-2 text-center font-sans text-base text-ink-soft">Coming in the next build.</Text>
    </View>
  );
}
