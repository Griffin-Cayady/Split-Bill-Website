import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { formatMoney } from "@shared/lib/currency";
import type { Currency, Person, PersonResult } from "@shared/lib/types";

interface PersonResultCardProps {
  person: Person;
  result: PersonResult;
  currency: Currency;
  defaultOpen?: boolean;
  /** Omit to render read-only. */
  onTogglePaid?: (personId: string) => void;
}

export function PersonResultCard({ person, result, currency, defaultOpen, onTogglePaid }: PersonResultCardProps) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const settled = Boolean(person.paid);

  return (
    <View className="rounded-2xl border-[1.5px] border-border bg-paper-raised">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        className="min-h-14 flex-row flex-wrap items-center gap-3.5 px-4 py-4"
      >
        <Avatar name={person.name} color={person.color} />
        <Text className="font-display-bold text-[19px] text-ink">{person.name}</Text>
        {settled && (
          <View className="rounded-full bg-teal-soft px-2.5 py-1">
            <Text className="font-mono-bold text-[11px] uppercase tracking-wide text-teal">Settled ✓</Text>
          </View>
        )}
        <Text className="ml-auto font-mono-bold text-xl text-ink">{formatMoney(result.total, currency)}</Text>
        <Text className="font-sans text-sm text-ink-soft">{open ? "▲" : "▼"}</Text>
      </Pressable>

      {open && (
        <View className="gap-1.5 border-t-[1.5px] border-dashed border-border px-4 py-3.5">
          {result.itemLines.map((line, i) => (
            <View key={`i${i}`} className="flex-row justify-between gap-2">
              <Text numberOfLines={1} className="shrink font-sans text-[15px] text-ink-soft">
                {line.label}
              </Text>
              <Text className="font-mono text-[15px] text-ink-soft">{formatMoney(line.share, currency)}</Text>
            </View>
          ))}
          {result.chargeLines.map((line, i) => {
            const tone = line.share < 0 ? "text-teal" : "text-ink-soft";
            return (
              <View key={`c${i}`} className={`flex-row justify-between gap-2 ${i === 0 && result.itemLines.length > 0 ? "mt-1" : ""}`}>
                <Text numberOfLines={1} className={`shrink font-sans text-[15px] ${tone}`}>
                  {line.label}
                </Text>
                <Text className={`font-mono text-[15px] ${tone}`}>{formatMoney(Math.round(line.share), currency)}</Text>
              </View>
            );
          })}
          {onTogglePaid && (
            <Pressable
              accessibilityRole="button"
              onPress={() => onTogglePaid(person.id)}
              className={`mt-2 min-h-11 self-start justify-center rounded-xl border-[1.5px] px-4 ${
                settled ? "border-teal-border bg-teal-soft" : "border-border"
              }`}
            >
              <Text className={`font-sans-bold text-sm ${settled ? "text-teal" : "text-ink"}`}>
                {settled ? "Unsettled" : "Mark as settled"}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
