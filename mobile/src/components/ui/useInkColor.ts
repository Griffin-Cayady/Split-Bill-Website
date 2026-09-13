import { useColorScheme } from "nativewind";

// Icons need literal colors (SVG stroke can't read CSS vars). These mirror
// --ink / --ink-soft / --accent / --accent-ink in global.css.
export const INK = { light: "#33291c", dark: "#f5ede0" } as const;
export const INK_SOFT = { light: "#8a7b66", dark: "#b8a88c" } as const;
export const ACCENT = { light: "#c6402c", dark: "#ff7a5a" } as const;
export const ACCENT_INK = { light: "#ffffff", dark: "#221b12" } as const;

export type InkTone = "ink" | "soft" | "accent" | "accent-ink";

export function useInkColor(tone: InkTone = "ink"): string {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";
  switch (tone) {
    case "soft":
      return INK_SOFT[scheme];
    case "accent":
      return ACCENT[scheme];
    case "accent-ink":
      return ACCENT_INK[scheme];
    default:
      return INK[scheme];
  }
}
