import { describe, expect, it } from "vitest";
import { computeBillResult } from "../../lib/calc";
import type { Bill } from "../../lib/types";
import { settleUp, settleUpSentence } from "./settleUp";

function bill(overrides: Partial<Bill> = {}): Bill {
  return {
    version: 1,
    title: "Dinner",
    dateISO: "2026-10-03",
    currency: { symbol: "Rp", roundingUnit: 1 },
    people: [
      { id: "A", name: "Ana", color: "#000" },
      { id: "B", name: "Budi", color: "#000" },
      { id: "C", name: "Cara", color: "#000" },
    ],
    items: [{ id: "1", name: "Rice", price: 30000, quantity: 1, mode: "equal", equalPersonIds: ["A", "B", "C"] }],
    charges: [],
    ...overrides,
  };
}

describe("settleUp", () => {
  it("puts the payer first and totals what the others still owe", () => {
    const b = bill({ payerId: "B" });
    const s = settleUp(b, computeBillResult(b));
    expect(s.ordered.map((r) => r.person.id)).toEqual(["B", "A", "C"]);
    expect(s.outstanding).toBe(20000);
    expect(settleUpSentence(s)).toBe("0 of 2 have paid Budi back.");
  });

  it("defaults the payer to the first person and counts settled people", () => {
    const b = bill({ people: bill().people.map((p) => (p.id === "C" ? { ...p, paid: true } : p)) });
    const s = settleUp(b, computeBillResult(b));
    expect(s.payer?.id).toBe("A");
    expect(s.outstanding).toBe(10000);
    expect(settleUpSentence(s)).toBe("1 of 2 have paid Ana back.");
  });
});
