import { Text, View } from "react-native";
import { initials } from "@shared/lib/id";

interface AvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

const dims = { sm: { box: 30, text: 11 }, md: { box: 44, text: 14 }, lg: { box: 56, text: 18 } };

export function Avatar({ name, color, size = "md" }: AvatarProps) {
  const d = dims[size];
  return (
    <View
      accessibilityElementsHidden
      style={{ width: d.box, height: d.box, borderRadius: d.box / 2, backgroundColor: color }}
      className="items-center justify-center"
    >
      <Text style={{ fontSize: d.text }} className="font-display-bold tracking-wide text-white">
        {initials(name)}
      </Text>
    </View>
  );
}
