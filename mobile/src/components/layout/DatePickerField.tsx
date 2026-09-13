import { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Button } from "@/components/ui/Button";

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function DatePickerField({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const date = fromISO(value);

  function handleChange(e: DateTimePickerEvent, d?: Date) {
    // Android shows a one-shot dialog; iOS keeps the spinner open until Done.
    if (Platform.OS === "android") setOpen(false);
    if (e.type === "set" && d) onChange(toISO(d));
  }

  return (
    <View className="gap-1.5">
      <Text className="font-sans-bold text-xs uppercase tracking-wide text-ink-soft">Date</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change date"
        onPress={() => setOpen(true)}
        className="h-12 justify-center rounded-xl border-[1.5px] border-border bg-paper px-3.5"
      >
        <Text className="font-mono text-sm text-ink">{value}</Text>
      </Pressable>
      {open && Platform.OS === "android" && <DateTimePicker value={date} mode="date" display="default" onChange={handleChange} />}
      {Platform.OS === "ios" && (
        <Modal transparent animationType="slide" visible={open} onRequestClose={() => setOpen(false)}>
          <Pressable onPress={() => setOpen(false)} className="flex-1 justify-end bg-black/40">
            <Pressable onPress={() => {}} className="gap-3 rounded-t-2xl bg-paper-raised p-4">
              <DateTimePicker value={date} mode="date" display="spinner" onChange={handleChange} />
              <Button onPress={() => setOpen(false)}>Done</Button>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
