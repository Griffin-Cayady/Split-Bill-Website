import type { Bill, BillResult, Person, PersonResult } from "../../lib/types";

export type SettleUp = {
  payer: Person | undefined;
  /** Payer first, then everyone who owes them, in bill order. */
  ordered: { person: Person; result: PersonResult }[];
  /** What the others still owe the payer (unsettled totals). */
  outstanding: number;
  settledCount: number;
  oweCount: number;
};

/** Who paid, who still owes them, and how much is outstanding. */
export function settleUp(bill: Bill, result: BillResult): SettleUp {
  const payer = bill.people.find((p) => p.id === bill.payerId) ?? bill.people[0];
  const rows = result.perPerson.flatMap((r) => {
    const person = bill.people.find((p) => p.id === r.personId);
    return person ? [{ person, result: r }] : [];
  });
  const ordered = [...rows.filter((r) => r.person.id === payer?.id), ...rows.filter((r) => r.person.id !== payer?.id)];
  const others = rows.filter((r) => r.person.id !== payer?.id && r.result.total > 0);
  return {
    payer,
    ordered,
    outstanding: others.filter((r) => !r.person.paid).reduce((a, r) => a + r.result.total, 0),
    settledCount: others.filter((r) => r.person.paid).length,
    oweCount: others.length,
  };
}

export function settleUpSentence(s: SettleUp): string {
  if (!s.payer || s.oweCount === 0) return "";
  const name = s.payer.name.trim() || "the payer";
  if (s.settledCount === s.oweCount) return `Everyone has paid ${name} back.`;
  return `${s.settledCount} of ${s.oweCount} have paid ${name} back.`;
}
