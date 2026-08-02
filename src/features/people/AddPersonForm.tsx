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
        placeholder={atCap ? `Max ${SOFT_CAP} people` : "Type a name, e.g. Sam"}
        disabled={atCap}
        className="flex-1 rounded-xl border-[1.5px] border-border bg-paper-raised px-4 text-[17px] text-ink placeholder:text-ink-faint focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none disabled:opacity-50"
        style={{ height: 52 }}
      />
      <Button type="submit" disabled={!name.trim() || atCap} className="shrink-0">
        <PlusIcon width={18} height={18} />
        Add
      </Button>
    </form>
  );
}
