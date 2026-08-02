// Distinct hues, each ≥4.5:1 contrast against white text (WCAG AA at normal
// text size) so initials stay legible on filled avatars/chips.
export const PERSON_COLORS = [
  "#e11d48", // rose-600
  "#c2410c", // orange-700
  "#b45309", // amber-700
  "#4d7c0f", // lime-700
  "#047857", // emerald-700
  "#0e7490", // cyan-700
  "#2563eb", // blue-600
  "#7c3aed", // violet-600
  "#a21caf", // fuchsia-700
  "#db2777", // pink-600
];

export function generateId(): string {
  return crypto.randomUUID();
}

export function colorForIndex(index: number): string {
  return PERSON_COLORS[index % PERSON_COLORS.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
