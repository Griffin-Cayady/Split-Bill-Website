import { useState } from "react";
import { View } from "react-native";
import { Button, ButtonLabel } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PlusIcon } from "@/components/ui/icons";
import { useInkColor } from "@/components/ui/useInkColor";
import { useBillStore } from "@/store/billStore";

const SOFT_CAP = 20;

export function AddPersonForm({ count }: { count: number }) {
  const addPerson = useBillStore((s) => s.addPerson);
  const [name, setName] = useState("");
  const iconColor = useInkColor("accent-ink");
  const atCap = count >= SOFT_CAP;
  const canAdd = Boolean(name.trim()) && !atCap;

  function submit() {
    const trimmed = name.trim();
    if (!trimmed || atCap) return;
    addPerson(trimmed);
    setName("");
  }

  return (
    <View className="flex-row gap-2">
      <Input
        containerClassName="flex-1"
        value={name}
        onChangeText={setName}
        placeholder={atCap ? `Max ${SOFT_CAP} people` : "Type a name, e.g. Sam"}
        editable={!atCap}
        returnKeyType="done"
        blurOnSubmit={false}
        onSubmitEditing={submit}
        autoCapitalize="words"
      />
      <Button onPress={submit} disabled={!canAdd} className="h-[52px]">
        <PlusIcon size={18} color={iconColor} />
        <ButtonLabel>Add</ButtonLabel>
      </Button>
    </View>
  );
}
