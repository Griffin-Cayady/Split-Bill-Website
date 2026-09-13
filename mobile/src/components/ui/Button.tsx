import { type ReactNode } from "react";
import { Pressable, Text, View, type PressableProps } from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

export interface ButtonProps extends Omit<PressableProps, "children"> {
  variant?: Variant;
  size?: Size;
  /** A string label, or icon + <ButtonLabel> elements. */
  children: ReactNode;
  className?: string;
}

const box: Record<Variant, { idle: string; pressed: string }> = {
  primary: { idle: "bg-accent", pressed: "bg-accent-hover" },
  secondary: {
    idle: "bg-paper-raised border-[1.5px] border-border",
    pressed: "bg-paper-hover border-[1.5px] border-border",
  },
  ghost: { idle: "bg-transparent", pressed: "bg-paper-hover" },
  danger: {
    idle: "bg-transparent border-[1.5px] border-accent-soft",
    pressed: "bg-accent-soft border-[1.5px] border-accent-soft",
  },
};
const label: Record<Variant, string> = {
  primary: "text-accent-ink",
  secondary: "text-ink",
  ghost: "text-ink-soft",
  danger: "text-accent",
};
const sizeBox: Record<Size, string> = { sm: "h-9 px-3 gap-1.5", md: "h-11 px-4 gap-2" };
const sizeText: Record<Size, string> = { sm: "text-sm", md: "text-[15px]" };

export function Button({ variant = "primary", size = "md", children, className = "", disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      {...props}
      className={`flex-row items-center justify-center rounded-xl ${sizeBox[size]} ${disabled ? "opacity-40" : ""} ${className}`}
    >
      {({ pressed }) => (
        <>
          {/* Background lives on an absolute layer so the row layout never shifts on press. */}
          <View pointerEvents="none" className={`absolute inset-0 rounded-xl ${pressed ? box[variant].pressed : box[variant].idle}`} />
          {typeof children === "string" ? (
            <Text className={`font-sans-bold ${sizeText[size]} ${label[variant]}`}>{children}</Text>
          ) : (
            children
          )}
        </>
      )}
    </Pressable>
  );
}

/** Text for mixed icon + label children, so callers don't repeat the label classes. */
export function ButtonLabel({ children, variant = "primary", size = "md" }: { children: ReactNode; variant?: Variant; size?: Size }) {
  return <Text className={`font-sans-bold ${sizeText[size]} ${label[variant]}`}>{children}</Text>;
}
