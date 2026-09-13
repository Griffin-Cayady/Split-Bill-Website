import { forwardRef } from "react";
import { Text, View } from "react-native";
import { formatMoney } from "@shared/lib/currency";
import type { Bill, BillResult, Currency } from "@shared/lib/types";

// Fixed palette (not tied to the app theme): an exported receipt should look
// identical no matter which theme the viewer captured it in. Same values as
// the website's ReceiptCard.
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

const SANS = "LibreFranklin_400Regular";
const SANS_SEMI = "LibreFranklin_600SemiBold";
const SANS_BOLD = "LibreFranklin_700Bold";
const MONO = "IBMPlexMono_500Medium";
const MONO_BOLD = "IBMPlexMono_700Bold";

function formatSigned(amount: number, currency: Currency): string {
  if (amount < 0) return `−${formatMoney(-amount, currency)}`;
  return formatMoney(amount, currency);
}

function longDate(dateISO: string): string {
  const date = new Date(`${dateISO}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateISO;
  return new Intl.DateTimeFormat("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(date);
}

interface ReceiptCardProps {
  bill: Bill;
  result: BillResult;
  width?: number;
}

/** Wrap-safe: the outer View is non-collapsable so react-native-view-shot can capture it. */
export const ReceiptCard = forwardRef<View, ReceiptCardProps>(function ReceiptCard({ bill, result, width = 360 }, ref) {
  const pad = Math.round(width * 0.069); // 44px at 640 wide, scaled
  return (
    <View
      ref={ref}
      collapsable={false}
      style={{ width, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER_STRONG }}
    >
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingTop: 28, paddingHorizontal: pad }}>
        <Text style={{ fontFamily: SANS_BOLD, fontSize: 20, color: INK }}>
          Split<Text style={{ color: ACCENT }}>Easy</Text>
        </Text>
        <Text style={{ fontFamily: MONO, fontSize: 11, color: MUTED, letterSpacing: 1 }}>RECEIPT · {bill.dateISO}</Text>
      </View>

      <View style={{ paddingTop: 22, paddingBottom: 20, paddingHorizontal: pad, borderBottomWidth: 1, borderBottomColor: BORDER }}>
        <Text style={{ fontFamily: SANS_SEMI, fontSize: 26, color: INK }}>{bill.title}</Text>
        <Text style={{ marginTop: 6, fontFamily: SANS, fontSize: 12.5, color: MUTED }}>
          {longDate(bill.dateISO)} · {bill.people.length} {bill.people.length === 1 ? "person" : "people"} ·{" "}
          {formatMoney(result.grandTotal, bill.currency)} total
        </Text>
      </View>

      {result.perPerson.map((p) => {
        const person = bill.people.find((x) => x.id === p.personId);
        if (!person) return null;
        const lines = [
          ...p.itemLines.map((l, i) => ({ key: `i${i}`, label: l.label, amount: l.share })),
          ...p.chargeLines.map((l, i) => ({ key: `c${i}`, label: l.label, amount: Math.round(l.share) })),
        ];
        return (
          <View key={p.personId} style={{ paddingTop: 18, paddingBottom: 14, paddingHorizontal: pad, borderBottomWidth: 1, borderBottomColor: BORDER }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: ACCENT, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: SANS_SEMI, fontSize: 12, color: CARD_BG }}>{person.name.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={{ fontFamily: SANS_SEMI, fontSize: 15, color: INK }}>{person.name}</Text>
              </View>
              <Text style={{ fontFamily: MONO_BOLD, fontSize: 15, color: INK }}>{formatSigned(p.total, bill.currency)}</Text>
            </View>
            {lines.map((line) => {
              const negative = line.amount < 0;
              return (
                <View key={line.key} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4, paddingLeft: 36 }}>
                  <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: SANS, fontSize: 13, color: negative ? ACCENT : INK_LINE }}>
                    {line.label}
                  </Text>
                  <View style={{ flex: 1, marginHorizontal: 10, borderBottomWidth: 1, borderStyle: "dotted", borderBottomColor: DOTTED }} />
                  <Text style={{ fontFamily: MONO, fontSize: 12.5, color: negative ? ACCENT : MUTED_AMOUNT }}>
                    {formatSigned(line.amount, bill.currency)}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingTop: 22, paddingBottom: 12, paddingHorizontal: pad }}>
        <Text style={{ fontFamily: SANS_BOLD, fontSize: 17, color: INK }}>Grand total</Text>
        <Text style={{ fontFamily: MONO_BOLD, fontSize: 20, color: INK }}>{formatMoney(result.grandTotal, bill.currency)}</Text>
      </View>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: BORDER,
          paddingVertical: 14,
          paddingHorizontal: pad,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: FOOTER_BG,
        }}
      >
        <Text style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1, color: MUTED }}>SPLIT WITH SPLITEASY</Text>
        <Text style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1, color: MUTED }}>NO SIGN-UP · NO SERVER</Text>
      </View>
    </View>
  );
});
