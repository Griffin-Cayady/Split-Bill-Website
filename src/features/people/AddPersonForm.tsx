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
        className="min-w-0 flex-1 rounded-xl border-[1.5px] border-field-border bg-paper-raised px-4 text-body-lg text-ink placeholder:text-ink-faint focus:border-accent focus:ring-2 focus:ring-accent/60 focus:outline-none disabled:opacity-50"
        style={{ height: 52 }}
      />
      <Button type="submit" disabled={!name.trim() || atCap} className="shrink-0">
        <PlusIcon width={18} height={18} />
        Add
      </Button>
    </form>
  );
}
