import { fieldClass } from "../../components/ui/field";
import clsx from "clsx";
import { Avatar } from "../../components/ui/Avatar";
import { Chip } from "../../components/ui/Chip";
import { Stepper } from "../../components/ui/Stepper";
import { Button } from "../../components/ui/Button";
import { AlertIcon, CheckIcon, XIcon } from "../../components/ui/icons";
import { useBillStore } from "../../store/billStore";
import { distributeRemainderEqually, itemTotal, validateUnitsAssignment } from "../../lib/calc";
import { formatMoney } from "../../lib/currency";
import type { Item } from "../../lib/types";

export function UnitsModeAssign({ item }: { item: Item }) {
  const bill = useBillStore((s) => s.bill);
  const updateItem = useBillStore((s) => s.updateItem);
  const people = bill.people;
  const assignments = item.unitAssignments ?? [];
  const validation = validateUnitsAssignment(item);
  const participantIds = new Set(assignments.map((a) => a.personId));
  const nonParticipants = people.filter((p) => !participantIds.has(p.id));
  const pricePerUnit = item.totalUnits ? itemTotal(item) / item.totalUnits : 0;

  function setTotalUnits(value: number) {
    updateItem(item.id, { totalUnits: Math.max(0, value) });
  }

  function addParticipant(personId: string) {
    updateItem(item.id, { unitAssignments: [...assignments, { personId, units: 0 }] });
  }

  function removeParticipant(personId: string) {
    updateItem(item.id, { unitAssignments: assignments.filter((a) => a.personId !== personId) });
  }

  function setUnits(personId: string, units: number) {
    updateItem(item.id, { unitAssignments: assignments.map((a) => (a.personId === personId ? { ...a, units } : a)) });
  }

  function splitRemainder() {
    const next = distributeRemainderEqually(item);
    updateItem(item.id, { unitAssignments: next.unitAssignments });
  }

  if (people.length === 0) return <p className="text-sm text-ink-soft">Add people first.</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-ink-soft">Total pieces</span>
        <input
          type="number"
          min={0}
          inputMode="decimal"
          value={item.totalUnits ?? ""}
          onChange={(e) => setTotalUnits(Number.parseFloat(e.target.value) || 0)}
          placeholder="0"
          aria-label="Total pieces"
          className={clsx(fieldClass, "h-11 w-[76px] px-3 text-center font-mono")}
        />
        {item.totalUnits ? (
          <span className="font-mono text-sm text-ink-soft">≈ {formatMoney(Math.round(pricePerUnit), bill.currency)} / piece</span>
        ) : null}
      </div>

      {assignments.length > 0 && (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {assignments.map((a) => {
            const person = people.find((p) => p.id === a.personId);
            if (!person) return null;
            return (
              <li key={a.personId} className="flex min-h-14 items-center gap-2 py-1.5 pr-1.5 pl-3">
                <Avatar name={person.name} color={person.color} size="sm" />
                <span className="min-w-0 flex-1 truncate text-base font-semibold text-ink">{person.name}</span>
                <Stepper value={a.units} onChange={(v) => setUnits(a.personId, v)} ariaLabel={`Pieces for ${person.name}`} min={0} />
                <button
                  type="button"
                  aria-label={`Remove ${person.name} from this item`}
                  onClick={() => removeParticipant(a.personId)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-paper-hover"
                >
                  <XIcon width={16} height={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {nonParticipants.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {nonParticipants.map((p) => (
            <Chip key={p.id} name={p.name} color={p.color} onClick={() => addParticipant(p.id)} />
          ))}
        </div>
      )}

      {item.totalUnits ? (
        <div
          role="status"
          className={clsx(
            "flex flex-wrap items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-bold",
            validation.status === "exact" && "bg-teal-soft text-teal",
            validation.status === "under" && "bg-amber-soft text-amber",
            validation.status === "over" && "bg-danger-soft text-danger",
          )}
        >
          {validation.status === "exact" ? <CheckIcon width={16} height={16} /> : <AlertIcon width={16} height={16} />}
          <span>
            {validation.status === "exact"
              ? `All ${validation.total} pieces assigned`
              : validation.status === "over"
                ? `Too many — ${validation.assigned} assigned but only ${validation.total} pieces`
                : `${validation.remaining} of ${validation.total} pieces left to assign`}
          </span>
          {validation.status === "under" && (
            <Button size="sm" variant="secondary" className="ml-auto" onClick={splitRemainder}>
              Split remaining {validation.remaining} equally
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg bg-amber-soft px-3.5 py-2.5 text-sm font-bold text-amber">Set how many pieces there are in total</div>
      )}
    </div>
  );
}
