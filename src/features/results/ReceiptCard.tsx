import { forwardRef } from "react";
import type { Bill, BillResult, Currency } from "../../lib/types";
import { formatMoney } from "../../lib/currency";
import { initials } from "../../lib/id";

interface ReceiptCardProps {
  bill: Bill;
  result: BillResult;
}

// Fixed palette (not tied to the app's light/dark CSS vars): a shared/exported
// receipt should look identical no matter which theme the viewer captured it
// in. Matches the "Receipt redesign" design import exactly.
const INK = "#241f19";
const INK_LINE = "#3a342b";
const MUTED = "#8a8175";
const MUTED_AMOUNT = "#6b6357";
const BORDER = "#eee8dc";
const BORDER_STRONG = "#e4ded3";
const CARD_BG = "#fffdf9";
const FOOTER_BG = "#faf7f0";
const DOTTED = "#ddd5c6";
const ACCENT = "#c2401b";

const SANS = "'Libre Franklin', sans-serif";
const MONO = "'IBM Plex Mono', monospace";

/** Matches the design's exact negative formatting: a leading minus before the symbol, e.g. "−Rp 500". */
function formatSigned(amount: number, currency: Currency): string {
  if (amount < 0) return `−${formatMoney(-amount, currency)}`;
  return formatMoney(amount, currency);
}

function longDate(dateISO: string): string {
  const date = new Date(`${dateISO}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateISO;
  return new Intl.DateTimeFormat("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(date);
}

type ReceiptLine = { key: string; label: string; amount: number };

export const ReceiptCard = forwardRef<HTMLDivElement, ReceiptCardProps>(function ReceiptCard({ bill, result }, ref) {
  const payer = bill.people.find((p) => p.id === bill.payerId) ?? bill.people[0];
  return (
    <div
      ref={ref}
      style={{
        width: 640,
        background: CARD_BG,
        border: `1px solid ${BORDER_STRONG}`,
        boxShadow: "0 24px 48px -24px rgba(48,38,28,0.25)",
        color: INK,
        fontFamily: SANS,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "36px 44px 0 44px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Split<span style={{ color: ACCENT }}>Easy</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: MUTED, letterSpacing: "0.08em" }}>RECEIPT · {bill.dateISO}</div>
      </div>

      <div style={{ padding: "28px 44px 24px 44px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em" }}>{bill.title}</div>
        <div style={{ marginTop: 6, fontSize: 13, color: MUTED }}>
          {longDate(bill.dateISO)} · {bill.people.length} {bill.people.length === 1 ? "person" : "people"} ·{" "}
          {formatMoney(result.grandTotal, bill.currency)} total
          {payer ? ` · paid by ${payer.name.trim() || "Unnamed"}` : ""}
        </div>
      </div>

      {result.perPerson.map((p) => {
        const person = bill.people.find((person) => person.id === p.personId);
        if (!person) return null;
        const lines: ReceiptLine[] = [
          ...p.itemLines.map((l, i) => ({ key: `i${i}`, label: l.label, amount: l.share })),
          ...p.chargeLines.map((l, i) => ({ key: `c${i}`, label: l.label, amount: Math.round(l.share) })),
        ];
        return (
          <div key={p.personId} style={{ padding: "22px 44px 6px 44px", borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: person.color,
                    color: CARD_BG,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {initials(person.name)}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{person.name}</div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600 }}>{formatSigned(p.total, bill.currency)}</div>
            </div>

            {lines.map((line) => {
              const negative = line.amount < 0;
              return (
                <div
                  key={line.key}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0 5px 36px" }}
                >
                  <div style={{ fontSize: 13.5, color: negative ? ACCENT : INK_LINE }}>{line.label}</div>
                  <div style={{ flex: 1, margin: "0 12px", borderBottom: `1px dotted ${DOTTED}`, transform: "translateY(-3px)" }} />
                  <div style={{ fontFamily: MONO, fontSize: 13, color: negative ? ACCENT : MUTED_AMOUNT }}>
                    {formatSigned(line.amount, bill.currency)}
                  </div>
                </div>
              );
            })}
            <div style={{ height: 14 }} />
          </div>
        );
      })}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "26px 44px 8px 44px" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Grand total</div>
        <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 600 }}>{formatMoney(result.grandTotal, bill.currency)}</div>
      </div>

      <div
        style={{
          borderTop: `1px solid ${BORDER}`,
          padding: "16px 44px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: FOOTER_BG,
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: MUTED }}>SPLIT WITH SPLITEASY</div>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: MUTED }}>NO SIGN-UP · NO SERVER</div>
      </div>
    </div>
  );
});
