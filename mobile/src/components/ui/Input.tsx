import { useState } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";
import { useColorScheme } from "nativewind";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  mono?: boolean;
  className?: string;
  containerClassName?: string;
}

export function Input({ label, error, mono, className = "", containerClassName = "", onFocus, onBlur, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const { colorScheme } = useColorScheme();
  const placeholderColor = colorScheme === "dark" ? "#7a6b52" : "#b7a98f"; // --ink-faint

  return (
    <View className={`gap-1 ${containerClassName}`}>
      {label && <Text className="font-sans-semibold text-xs uppercase tracking-wide text-ink-soft">{label}</Text>}
      <TextInput
        placeholderTextColor={placeholderColor}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
        className={`h-[52px] rounded-xl border-[1.5px] bg-paper-raised px-3.5 text-[17px] text-ink ${mono ? "font-mono" : "font-sans"} ${
          error || focused ? "border-accent" : "border-border"
        } ${props.editable === false ? "opacity-50" : ""} ${className}`}
      />
      {error && <Text className="font-sans text-xs text-accent">{error}</Text>}
    </View>
  );
}
