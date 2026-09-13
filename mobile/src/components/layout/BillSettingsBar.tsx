import { View } from "react-native";
import { Input } from "@/components/ui/Input";
import { useBillStore } from "@/store/billStore";
import { DatePickerField } from "./DatePickerField";
import { CurrencyPicker } from "./CurrencyPicker";
import { ResetBillButton } from "./ResetBillButton";

export function BillSettingsBar() {
  const bill = useBillStore((s) => s.bill);
  const setTitle = useBillStore((s) => s.setTitle);
  const setDateISO = useBillStore((s) => s.setDateISO);
  const setCurrency = useBillStore((s) => s.setCurrency);
  return (
    <View className="mx-4 gap-3.5 rounded-2xl border-[1.5px] border-border bg-paper-raised px-4 py-4">
      <Input label="Bill name" value={bill.title} onChangeText={setTitle} className="h-12 bg-paper font-display text-lg" />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <DatePickerField value={bill.dateISO} onChange={setDateISO} />
        </View>
        <View className="flex-1">
          <CurrencyPicker value={bill.currency} onChange={setCurrency} />
        </View>
      </View>
      <ResetBillButton />
    </View>
  );
}
