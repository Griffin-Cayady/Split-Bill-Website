/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-raised": "var(--paper-raised)",
        "paper-hover": "var(--paper-hover)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-faint": "var(--ink-faint)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-ink": "var(--accent-ink)",
        "accent-soft": "var(--accent-soft)",
        teal: "var(--teal)",
        "teal-soft": "var(--teal-soft)",
        "teal-border": "var(--teal-border)",
        amber: "var(--amber)",
        "amber-soft": "var(--amber-soft)",
      },
      fontFamily: {
        display: ["PlusJakartaSans_600SemiBold"],
        "display-bold": ["PlusJakartaSans_800ExtraBold"],
        sans: ["LibreFranklin_400Regular"],
        "sans-medium": ["LibreFranklin_500Medium"],
        "sans-semibold": ["LibreFranklin_600SemiBold"],
        "sans-bold": ["LibreFranklin_700Bold"],
        mono: ["IBMPlexMono_500Medium"],
        "mono-bold": ["IBMPlexMono_700Bold"],
      },
    },
  },
  plugins: [],
};
