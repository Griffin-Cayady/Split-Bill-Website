import { useState } from "react";
import { Avatar } from "../../components/ui/Avatar";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { TrashIcon } from "../../components/ui/icons";
import { useBillStore } from "../../store/billStore";
import type { Person } from "../../lib/types";

interface PersonRowProps {
  person: Person;
  hasAssignments: boolean;
}

export function PersonRow({ person, hasAssignments }: PersonRowProps) {
  const updatePersonName = useBillStore((s) => s.updatePersonName);
  const removePerson = useBillStore((s) => s.removePerson);
  const [confirmRemove, setConfirmRemove] = useState(false);

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
        onClick={() => (hasAssignments ? setConfirmRemove(true) : removePerson(person.id))}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-accent-soft hover:text-accent-hover"
      >
        <TrashIcon />
      </button>

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
    </div>
  );
}
