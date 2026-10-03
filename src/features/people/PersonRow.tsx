import { Avatar } from "../../components/ui/Avatar";
import { TrashIcon } from "../../components/ui/icons";
import { useBillStore } from "../../store/billStore";
import { undoableBillChange } from "../../store/undoableBillChange";
import type { Person } from "../../lib/types";

interface PersonRowProps {
  person: Person;
  hasAssignments: boolean;
}

export function PersonRow({ person, hasAssignments }: PersonRowProps) {
  const updatePersonName = useBillStore((s) => s.updatePersonName);
  const removePerson = useBillStore((s) => s.removePerson);

  // Removal is instant but undoable — undo restores their item assignments too — so no confirmation step.
  function remove() {
    const name = person.name.trim() || "person";
    undoableBillChange(hasAssignments ? `Removed ${name} and their shares` : `Removed ${name}`, () => removePerson(person.id));
  }

  return (
    <div className="flex flex-wrap items-center gap-3.5 rounded-2xl border-[1.5px] border-border bg-paper-raised px-3.5 py-3 sm:flex-nowrap">
      <Avatar name={person.name} color={person.color} />

      <input
        value={person.name}
        onChange={(e) => updatePersonName(person.id, e.target.value)}
        aria-label="Person name"
        className="min-w-0 flex-1 rounded-lg bg-transparent px-1 py-1.5 text-lg font-bold text-ink focus:outline-none"
      />

      <button
        type="button"
        aria-label={`Remove ${person.name}`}
        onClick={remove}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-accent-soft hover:text-accent-hover"
      >
        <TrashIcon />
      </button>
    </div>
  );
}
