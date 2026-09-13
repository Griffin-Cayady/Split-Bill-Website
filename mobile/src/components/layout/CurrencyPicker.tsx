import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { CURRENCY_PRESETS } from "@shared/lib/currency";
import type { Currency } from "@shared/lib/types";

export function CurrencyPicker({ value, onChange }: { value: Currency; onChange: (c: Currency) => void }) {
  const [open, setOpen] = useState(false);
  const current = CURRENCY_PRESETS.find((p) => p.symbol === value.symbol);
  const label = current ? `${current.symbol} ${current.code}` : value.symbol;
  return (
    <View className="gap-1.5">
      <Text className="font-sans-bold text-xs uppercase tracking-wide text-ink-soft">Currency</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change currency"
        onPress={() => setOpen(true)}
        className="h-12 justify-center rounded-xl border-[1.5px] border-border bg-paper px-3.5"
      >
        <Text className="font-sans text-sm text-ink">{label}</Text>
      </Pressable>
      <Modal transparent animationType="slide" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} className="flex-1 justify-end bg-black/40">
          <Pressable onPress={() => {}} className="max-h-[70%] rounded-t-2xl bg-paper-raised pb-6 pt-3">
            <Text className="px-5 pb-2 font-display-bold text-lg text-ink">Currency</Text>
            <FlatList
              data={CURRENCY_PRESETS}
              keyExtractor={(p) => p.code}
              renderItem={({ item }) => {
                const active = item.symbol === value.symbol;
                return (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      onChange({ symbol: item.symbol, roundingUnit: item.defaultRoundingUnit });
                      setOpen(false);
                    }}
                    className={`flex-row items-center justify-between px-5 py-3.5 ${active ? "bg-accent-soft" : ""}`}
                  >
                    <Text className="font-sans-semibold text-base text-ink">
                      {item.symbol} {item.code}
                    </Text>
                    {active && <Text className="font-sans-bold text-accent">✓</Text>}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
