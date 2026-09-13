import { Pressable, Text, View } from "react-native";
import { useColorScheme } from "nativewind";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { CommitInput } from "@/components/ui/CommitInput";
import { Stepper } from "@/components/ui/Stepper";
import { AlertIcon, CheckIcon, XIcon } from "@/components/ui/icons";
import { useInkColor } from "@/components/ui/useInkColor";
import { useBillStore } from "@/store/billStore";
import { distributeRemainderEqually, itemTotal, validateUnitsAssignment } from "@shared/lib/calc";
import { formatMoney } from "@shared/lib/currency";
import type { Item } from "@shared/lib/types";

// Icon strokes for the status banner (mirror --teal / --amber / --accent-hover).
const STATUS_COLORS = {
  light: { exact: "#2e7d4f", under: "#b26a00", over: "#a33322" },
  dark: { exact: "#6fbe8f", under: "#e0a030", over: "#ff9678" },
};
const BANNER_BOX = { exact: "bg-teal-soft", under: "bg-amber-soft", over: "bg-accent-soft" };
const BANNER_TEXT = { exact: "text-teal", under: "text-amber", over: "text-accent-hover" };

export function UnitsModeAssign({ item }: { item: Item }) {
  const bill = useBillStore((s) => s.bill);
  const updateItem = useBillStore((s) => s.updateItem);
  const { colorScheme } = useColorScheme();
  const inkSoft = useInkColor("soft");
  const people = bill.people;
  const assignments = item.unitAssignments ?? [];
  const validation = validateUnitsAssignment(item);
  const participantIds = new Set(assignments.map((a) => a.personId));
  const nonParticipants = people.filter((p) => !participantIds.has(p.id));
  const pricePerUnit = item.totalUnits ? itemTotal(item) / item.totalUnits : 0;
  const statusColor = STATUS_COLORS[colorScheme === "dark" ? "dark" : "light"][validation.status];

  const setTotalUnits = (text: string) => updateItem(item.id, { totalUnits: Math.max(0, Number.parseFloat(text) || 0) });
  const addParticipant = (personId: string) => updateItem(item.id, { unitAssignments: [...assignments, { personId, units: 0 }] });
  const removeParticipant = (personId: string) =>
    updateItem(item.id, { unitAssignments: assignments.filter((a) => a.personId !== personId) });
  const setUnits = (personId: string, units: number) =>
    updateItem(item.id, { unitAssignments: assignments.map((a) => (a.personId === personId ? { ...a, units } : a)) });
  const splitRemainder = () => updateItem(item.id, { unitAssignments: distributeRemainderEqually(item).unitAssignments });

  if (people.length === 0) return <Text className="font-sans text-sm text-ink-soft">Add people first.</Text>;

  const bannerCopy =
    validation.status === "exact"
      ? `✓ All ${validation.total} pieces assigned`
      : validation.status === "over"
        ? `Too many — ${validation.assigned} assigned but only ${validation.total} pieces`
        : `${validation.remaining} of ${validation.total} pieces left to assign`;

  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap items-center gap-3">
        <Text className="font-sans-bold text-xs uppercase tracking-wide text-ink-soft">Total pieces</Text>
        <CommitInput
          accessibilityLabel="Total pieces"
          value={item.totalUnits ? String(item.totalUnits) : ""}
          onCommit={setTotalUnits}
          className="h-11 w-[76px] rounded-xl border-[1.5px] border-border bg-paper px-3 text-center font-mono text-ink"
        />
        {item.totalUnits ? (
          <Text className="font-mono text-sm text-ink-soft">≈ {formatMoney(Math.round(pricePerUnit), bill.currency)} / piece</Text>
        ) : null}
      </View>

      {assignments.length > 0 && (
        <View className="gap-2">
          {assignments.map((a) => {
            const person = people.find((p) => p.id === a.personId);
            if (!person) return null;
            return (
              <View key={a.personId} className="flex-row items-center gap-3 rounded-xl bg-paper px-3 py-2">
                <Avatar name={person.name} color={person.color} size="sm" />
                <Text numberOfLines={1} className="flex-1 font-sans-bold text-base text-ink">
                  {person.name}
                </Text>
                <Stepper value={a.units} onChange={(v) => setUnits(a.personId, v)} min={0} ariaLabel={`pieces for ${person.name}`} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${person.name} from this item`}
                  onPress={() => removeParticipant(a.personId)}
                  className="h-9 w-9 items-center justify-center rounded-full"
                >
                  <XIcon size={16} color={inkSoft} />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {nonParticipants.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {nonParticipants.map((p) => (
            <Chip key={p.id} name={p.name} color={p.color} onPress={() => addParticipant(p.id)} />
          ))}
        </View>
      )}

      {item.totalUnits ? (
        <View className={`flex-row flex-wrap items-center gap-2 rounded-xl px-3.5 py-2.5 ${BANNER_BOX[validation.status]}`}>
          {validation.status === "exact" ? <CheckIcon size={16} color={statusColor} /> : <AlertIcon size={16} color={statusColor} />}
          <Text className={`flex-1 font-sans-bold text-sm ${BANNER_TEXT[validation.status]}`}>{bannerCopy}</Text>
          {validation.status === "under" && (
            <Button size="sm" variant="secondary" onPress={splitRemainder}>
              {`Split remaining ${validation.remaining} equally`}
            </Button>
          )}
        </View>
      ) : (
        <View className="rounded-xl bg-amber-soft px-3.5 py-2.5">
          <Text className="font-sans-bold text-sm text-amber">Set how many pieces there are in total</Text>
        </View>
      )}
    </View>
  );
}
