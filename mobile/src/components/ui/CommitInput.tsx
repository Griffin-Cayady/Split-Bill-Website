import { useEffect, useState } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { useColorScheme } from "nativewind";

export interface CommitInputProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  /** Canonical display text derived from the store; local edits are committed on blur/submit. */
  value: string;
  onCommit: (text: string) => void;
  className?: string;
}

/** Numeric field that keeps its own text while typing and commits once (blur / submit). */
export function CommitInput({ value, onCommit, onBlur, onSubmitEditing, className = "", ...props }: CommitInputProps) {
  const [text, setText] = useState(value);
  const { colorScheme } = useColorScheme();
  useEffect(() => setText(value), [value]);
  return (
    <TextInput
      keyboardType="decimal-pad"
      placeholder="0"
      placeholderTextColor={colorScheme === "dark" ? "#7a6b52" : "#b7a98f"}
      {...props}
      value={text}
      onChangeText={setText}
      onBlur={(e) => {
        onCommit(text);
        onBlur?.(e);
      }}
      onSubmitEditing={(e) => {
        onCommit(text);
        onSubmitEditing?.(e);
      }}
      className={className}
    />
  );
}
