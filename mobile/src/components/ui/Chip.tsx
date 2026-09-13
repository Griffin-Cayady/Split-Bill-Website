import { Pressable, Text } from "react-native";
import { Avatar } from "./Avatar";

interface ChipProps {
  name: string;
  color: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export function Chip({ name, color, selected, onPress, disabled }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(selected), disabled: Boolean(disabled) }}
      style={selected ? { backgroundColor: color, borderColor: color } : undefined}
      className={`h-12 min-w-12 flex-row items-center gap-2 rounded-full border-[1.5px] pl-1.5 pr-4 ${
        selected ? "" : "border-border bg-paper-raised"
      } ${disabled ? "opacity-40" : ""}`}
    >
      <Avatar name={name} color={selected ? "rgba(255,255,255,0.28)" : color} size="sm" />
      <Text numberOfLines={1} className={`max-w-[144px] font-sans-bold text-sm ${selected ? "text-white" : "text-ink"}`}>
        {name}
      </Text>
      {onPress && (
        <Text className={`font-sans-bold text-base ${selected ? "text-white" : "text-ink"}`}>{selected ? "✓" : "+"}</Text>
      )}
    </Pressable>
  );
}
