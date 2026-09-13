import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TrashIcon } from "@/components/ui/icons";
import { useInkColor } from "@/components/ui/useInkColor";
import { useBillStore } from "@/store/billStore";
import type { Person } from "@shared/lib/types";

export function PersonRow({ person, hasAssignments }: { person: Person; hasAssignments: boolean }) {
  const updatePersonName = useBillStore((s) => s.updatePersonName);
  const removePerson = useBillStore((s) => s.removePerson);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const inkSoft = useInkColor("soft");

  return (
    <View className="flex-row items-center gap-3.5 rounded-2xl border-[1.5px] border-border bg-paper-raised px-3.5 py-3">
      <Avatar name={person.name} color={person.color} />
      <TextInput
        accessibilityLabel="Person name"
        value={person.name}
        onChangeText={(t) => updatePersonName(person.id, t)}
        className="min-w-0 flex-1 px-1 py-1.5 font-sans-bold text-lg text-ink"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${person.name}`}
        onPress={() => (hasAssignments ? setConfirmRemove(true) : removePerson(person.id))}
        className="h-11 w-11 items-center justify-center rounded-full active:bg-accent-soft"
      >
        <TrashIcon color={inkSoft} />
      </Pressable>
      <ConfirmDialog
        open={confirmRemove}
        title={`Remove ${person.name}?`}
        description={`${person.name} has items assigned to them. Removing them will unassign those items — you'll need to reassign them.`}
        confirmLabel="Remove"
        danger
        onConfirm={() => {
          removePerson(person.id);
          setConfirmRemove(false);
        }}
        onCancel={() => setConfirmRemove(false)}
      />
    </View>
  );
}
