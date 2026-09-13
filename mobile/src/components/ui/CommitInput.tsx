import { useEffect, useState } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { useColorScheme } from "nativewind";

export interface CommitInputProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  /** Canonical display text derived from the store. */
  value: string;
  onCommit: (text: string) => void;
  className?: string;
}

/**
 * Numeric field that commits on every keystroke (so a dismissed keyboard never
 * loses input — on Android, hiding the keyboard does not blur the field) while
 * keeping the raw text the user typed until focus leaves. The canonical value
 * only overwrites the text when the field is not focused, so typing "12." or
 * "0,5" is never reformatted mid-entry.
 */
export function CommitInput({ value, onCommit, onFocus, onBlur, onSubmitEditing, className = "", ...props }: CommitInputProps) {
  const [text, setText] = useState(value);
  const [focused, setFocused] = useState(false);
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    if (!focused) setText(value);
  }, [value, focused]);

  return (
    <TextInput
      keyboardType="decimal-pad"
      placeholder="0"
      placeholderTextColor={colorScheme === "dark" ? "#7a6b52" : "#b7a98f"}
      {...props}
      value={text}
      onChangeText={(t) => {
        setText(t);
        onCommit(t);
      }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
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
