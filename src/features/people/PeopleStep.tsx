import { useBillStore } from "../../store/billStore";
import { personHasAssignments } from "../../lib/calc";
import { AddPersonForm } from "./AddPersonForm";
import { PersonRow } from "./PersonRow";
import { PayerPicker } from "./PayerPicker";

export function PeopleStep() {
  const bill = useBillStore((s) => s.bill);
  const { people, payerId } = bill;
  const payer = people.find((p) => p.id === payerId) ?? people[0];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-display font-extrabold tracking-tight text-ink">Who's sharing the bill?</h1>
        <p className="mt-1.5 text-base text-ink-soft">Add everyone at the table. You'll pick what they had next.</p>
      </div>

      <AddPersonForm count={people.length} />

      {people.length === 0 ? (
        <div className="rounded-xl border border-border px-6 py-8 text-center">
          <p className="text-base text-ink-soft">No one yet — type the first name above and press Add.</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-paper-raised shadow-card">
          {people.map((p, i) => (
            <PersonRow key={p.id} person={p} position={i + 1} hasAssignments={personHasAssignments(bill, p.id)} />
          ))}
        </ul>
      )}

      {people.length === 1 && <p className="text-sm font-semibold text-amber">Add at least one more person to split the bill.</p>}

      {people.length >= 2 && payer && (
        <div className="mt-2 border-t border-border pt-5">
          <PayerPicker people={people} payerId={payer.id} />
        </div>
      )}
    </div>
  );
}
