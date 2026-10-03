/** "3 Oct 2026" in the viewer's locale, from a YYYY-MM-DD bill date (parsed as a local date, not UTC). */
export function formatBillDate(dateISO: string): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  if (!y || !m || !d) return dateISO;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
