/**
 * The one text-field look used across the app: a raised field with a ≥3:1
 * boundary (WCAG 1.4.11), an ink border on hover and an accent ring on focus.
 * Callers add height, width, padding and type styles.
 */
export const fieldClass =
  "rounded-lg border border-field-border bg-paper-raised text-ink placeholder:font-normal placeholder:text-ink-faint transition-colors hover:border-ink focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none disabled:opacity-50";
