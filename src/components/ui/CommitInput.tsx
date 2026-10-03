import { useEffect, useState, type InputHTMLAttributes } from "react";

export interface CommitInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  /** Canonical display text derived from the store. */
  value: string;
  onCommit: (text: string) => void;
}

/**
 * Numeric field that commits on every keystroke, so totals and step gating
 * update live and a dismissed mobile keyboard (which never blurs on Android)
 * cannot lose input. The raw typed text is kept while focused, so "12." or
 * "0,5" is never reformatted mid-entry; the canonical value only replaces it
 * once focus leaves.
 */
export function CommitInput({ value, onCommit, onFocus, onBlur, onKeyDown, ...props }: CommitInputProps) {
  const [text, setText] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(value);
  }, [value, focused]);

  return (
    <input
      inputMode="decimal"
      placeholder="0"
      {...props}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onCommit(e.target.value);
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
      onKeyDown={(e) => {
        if (e.key === "Enter") onCommit(text);
        onKeyDown?.(e);
      }}
    />
  );
}
