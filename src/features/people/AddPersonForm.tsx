import clsx from "clsx";
import { fieldClass } from "../../components/ui/field";
import { useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { PlusIcon } from "../../components/ui/icons";
import { useBillStore } from "../../store/billStore";

const SOFT_CAP = 20;

export function AddPersonForm({ count }: { count: number }) {
  const addPerson = useBillStore((s) => s.addPerson);
  const [name, setName] = useState("");
  const atCap = count >= SOFT_CAP;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || atCap) return;
    addPerson(trimmed);
    setName("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={atCap ? `That's the maximum of ${SOFT_CAP} people` : "Type a name, e.g. Sam"}
        aria-label="Name of person to add"
        enterKeyHint="done"
        disabled={atCap}
        className={clsx(fieldClass, "min-w-0 flex-1 px-4 text-body-lg")}
        style={{ height: 52 }}
      />
      <Button type="submit" disabled={!name.trim() || atCap} className="shrink-0">
        <PlusIcon width={18} height={18} />
        Add
      </Button>
    </form>
  );
}
