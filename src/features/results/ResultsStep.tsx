import { useBillStore } from "../../store/billStore";
import { computeBillResult, reconcileBill, validateBill } from "../../lib/calc";
import { formatMoney } from "../../lib/currency";
import { PersonResultCard } from "./PersonResultCard";
import { ShareActions } from "./ShareActions";
import { ReconciliationLines } from "./ReconciliationLines";
import { useUIStore } from "../../store/uiStore";

export function ResultsStep() {
  const bill = useBillStore((s) => s.bill);
  const togglePersonPaid = useBillStore((s) => s.togglePersonPaid);
  const setStep = useUIStore((s) => s.setStep);

  if (bill.people.length === 0 || bill.items.length === 0) {
    return (
      <div className="rounded-2xl border-[1.5px] border-dashed border-border px-6 py-8 text-center">
        <p className="text-base text-ink-soft">Add people and items first to see who owes what.</p>
        <button
          type="button"
          onClick={() => setStep("people")}
          className="mt-4 min-h-11 rounded-xl border-[1.5px] border-border bg-paper-raised px-4 text-sm font-bold text-ink hover:bg-paper-hover"
        >
          Back to People
        </button>
      </div>
    );
  }

  const result = computeBillResult(bill);
  const validation = validateBill(bill);
  const rec = reconcileBill(bill, result);
  const payerId = bill.payerId ?? bill.people[0]?.id;
  const nonPayers = bill.people.filter((p) => p.id !== payerId);
  const settledCount = nonPayers.filter((p) => p.paid).length;
  const settledText = nonPayers.length > 0 ? `${settledCount} of ${nonPayers.length} people have settled up.` : "";

  return (
    <div className="flex flex-col gap-5 pb-16">
      <div>
        <h1 className="font-display text-[30px] font-extrabold tracking-tight text-ink">Who owes what</h1>
        <p className="mt-1.5 text-base text-ink-soft">Tap a card to see the full breakdown. {settledText}</p>
      </div>

      {!validation.valid && (
        <div
          role="alert"
          className="rounded-xl border-[1.5px] border-accent bg-accent-soft px-3.5 py-2.5 text-sm font-semibold text-accent-hover"
        >
          {rec.unassigned > 0
            ? `${formatMoney(rec.unassigned, bill.currency)} of items isn't assigned to anyone yet, so these totals are short.`
            : "Some items still need attention before these totals are final."}
          <button type="button" onClick={() => setStep("items")} className="ml-1 font-extrabold underline underline-offset-2">
            Review items
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {result.perPerson.map((p) => {
          const person = bill.people.find((person) => person.id === p.personId);
          if (!person) return null;
          return (
            <PersonResultCard key={p.personId} person={person} result={p} currency={bill.currency} onTogglePaid={togglePersonPaid} />
          );
        })}
      </div>

      <ReconciliationLines bill={bill} rec={rec} />

      <div className="pt-1">
        <ShareActions bill={bill} />
      </div>
    </div>
  );
}
