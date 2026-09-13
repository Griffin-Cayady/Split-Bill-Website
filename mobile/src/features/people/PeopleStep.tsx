import { Text, View } from "react-native";
import { useBillStore } from "@/store/billStore";
import { personHasAssignments } from "@shared/lib/calc";
import { AddPersonForm } from "./AddPersonForm";
import { PersonRow } from "./PersonRow";

export function PeopleStep() {
  const bill = useBillStore((s) => s.bill);
  const { people, payerId } = bill;
  const payer = people.find((p) => p.id === payerId) ?? people[0];

  return (
    <View className="gap-5">
      <View>
        <Text className="font-display-bold text-[30px] tracking-tight text-ink">Who's sharing the bill?</Text>
        <Text className="mt-1.5 font-sans text-base text-ink-soft">Add everyone at the table. You'll pick what they had next.</Text>
      </View>

      <AddPersonForm count={people.length} />

      {people.length === 0 ? (
        <View className="rounded-2xl border-[1.5px] border-dashed border-border px-6 py-8">
          <Text className="text-center font-sans text-base text-ink-soft">No one yet — type the first name above and press Add.</Text>
        </View>
      ) : (
        <View className="gap-2.5">
          {people.map((p) => (
            <PersonRow key={p.id} person={p} hasAssignments={personHasAssignments(bill, p.id)} />
          ))}
        </View>
      )}

      {people.length === 1 && (
        <Text className="font-sans-semibold text-sm text-amber">Add at least one more person to split the bill.</Text>
      )}
      {people.length >= 2 && payer && (
        <Text className="px-0.5 font-sans text-sm text-ink-soft">
          {payer.name} is treated as the one who paid — others settle up with them.
        </Text>
      )}
    </View>
  );
}
