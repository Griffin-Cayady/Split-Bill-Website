import { describe, expect, it } from "vitest";
import {
  allocateInteger,
  computeBillResult,
  computeItemPersonShares,
  distributeRemainderEqually,
  itemDiscountAmount,
  itemNetTotal,
  itemTotal,
  personHasAssignments,
  roundHalfUp,
  validateBill,
  validateUnitsAssignment,
} from "./calc";
import type { Bill, Item, Person } from "./types";

function person(id: string, name: string): Person {
  return { id, name, color: "#000" };
}

const A = person("A", "Alice");
const B = person("B", "Bob");
const C = person("C", "Cara");

function baseBill(overrides: Partial<Bill> = {}): Bill {
  return {
    version: 1,
    title: "Test Bill",
    dateISO: "2026-08-01",
    currency: { symbol: "Rp", roundingUnit: 1 },
    people: [A, B, C],
    items: [],
    charges: [],
    ...overrides,
  };
}

describe("itemTotal", () => {
  it("multiplies price by quantity", () => {
    expect(itemTotal({ id: "i", name: "x", price: 40000, quantity: 2, mode: "equal" })).toBe(80000);
  });
});

describe("allocateInteger", () => {
  it("sums exactly to total for clean divisions", () => {
    const result = allocateInteger(40000, [2, 3, 3]);
    expect(result).toEqual([10000, 15000, 15000]);
  });

  it("sums exactly to total for non-divisible splits (largest remainder)", () => {
    const result = allocateInteger(100, [1, 1, 1]);
    expect(result.reduce((a, b) => a + b, 0)).toBe(100);
    expect(result).toEqual([34, 33, 33]);
  });

  it("returns empty array for no weights", () => {
    expect(allocateInteger(100, [])).toEqual([]);
  });

  it("falls back to equal split when weights sum to zero", () => {
    const result = allocateInteger(90, [0, 0, 0]);
    expect(result).toEqual([30, 30, 30]);
  });
});

describe("Feature A — Split by units (PRD §5.1 acceptance test)", () => {
  it("Takoyaki: 40,000 / 8pcs, A=2 B=3 C=3 -> 10,000 / 15,000 / 15,000", () => {
    const item: Item = {
      id: "takoyaki",
      name: "Takoyaki",
      price: 40000,
      quantity: 1,
      mode: "units",
      totalUnits: 8,
      unitAssignments: [
        { personId: "A", units: 2 },
        { personId: "B", units: 3 },
        { personId: "C", units: 3 },
      ],
    };
    const shares = computeItemPersonShares(item);
    expect(shares.get("A")).toBe(10000);
    expect(shares.get("B")).toBe(15000);
    expect(shares.get("C")).toBe(15000);
  });

  it("validateUnitsAssignment reports under-assignment with remaining count", () => {
    const item: Item = {
      id: "i",
      name: "Takoyaki",
      price: 40000,
      quantity: 1,
      mode: "units",
      totalUnits: 8,
      unitAssignments: [
        { personId: "A", units: 2 },
        { personId: "B", units: 3 },
      ],
    };
    const v = validateUnitsAssignment(item);
    expect(v.status).toBe("under");
    expect(v.assigned).toBe(5);
    expect(v.remaining).toBe(3);
  });

  it("validateUnitsAssignment reports over-assignment (blocking)", () => {
    const item: Item = {
      id: "i",
      name: "Takoyaki",
      price: 40000,
      quantity: 1,
      mode: "units",
      totalUnits: 8,
      unitAssignments: [
        { personId: "A", units: 5 },
        { personId: "B", units: 5 },
      ],
    };
    const v = validateUnitsAssignment(item);
    expect(v.status).toBe("over");
  });

  it("validateUnitsAssignment reports exact assignment", () => {
    const item: Item = {
      id: "i",
      name: "Takoyaki",
      price: 40000,
      quantity: 1,
      mode: "units",
      totalUnits: 8,
      unitAssignments: [
        { personId: "A", units: 4 },
        { personId: "B", units: 4 },
      ],
    };
    expect(validateUnitsAssignment(item).status).toBe("exact");
  });

  it("distributeRemainderEqually splits unassigned units evenly among participants", () => {
    const item: Item = {
      id: "i",
      name: "Takoyaki",
      price: 40000,
      quantity: 1,
      mode: "units",
      totalUnits: 8,
      unitAssignments: [
        { personId: "A", units: 2 },
        { personId: "B", units: 3 },
      ],
    };
    const result = distributeRemainderEqually(item);
    const total = (result.unitAssignments ?? []).reduce((a, b) => a + b.units, 0);
    expect(total).toBe(8);
    expect(validateUnitsAssignment(result).status).toBe("exact");
  });

  it("distributeRemainderEqually is a no-op when already exact", () => {
    const item: Item = {
      id: "i",
      name: "Takoyaki",
      price: 40000,
      quantity: 1,
      mode: "units",
      totalUnits: 8,
      unitAssignments: [
        { personId: "A", units: 4 },
        { personId: "B", units: 4 },
      ],
    };
    expect(distributeRemainderEqually(item)).toEqual(item);
  });

  it("allows fractional units", () => {
    const item: Item = {
      id: "i",
      name: "Cake",
      price: 10000,
      quantity: 1,
      mode: "units",
      totalUnits: 2,
      unitAssignments: [
        { personId: "A", units: 0.5 },
        { personId: "B", units: 1.5 },
      ],
    };
    expect(validateUnitsAssignment(item).status).toBe("exact");
    const shares = computeItemPersonShares(item);
    expect((shares.get("A") ?? 0) + (shares.get("B") ?? 0)).toBe(10000);
  });
});

describe("Equal mode", () => {
  it("assigns the full item total to a single selected person", () => {
    const item: Item = { id: "i", name: "x", price: 25000, quantity: 1, mode: "equal", equalPersonIds: ["A"] };
    const shares = computeItemPersonShares(item);
    expect(shares.get("A")).toBe(25000);
    expect(shares.size).toBe(1);
  });

  it("splits evenly, reconciling exactly even on non-divisible totals", () => {
    const item: Item = {
      id: "i",
      name: "x",
      price: 100,
      quantity: 1,
      mode: "equal",
      equalPersonIds: ["A", "B", "C"],
    };
    const shares = computeItemPersonShares(item);
    const sum = Array.from(shares.values()).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it("multiplies by quantity before splitting", () => {
    const item: Item = { id: "i", name: "x", price: 5000, quantity: 3, mode: "equal", equalPersonIds: ["A"] };
    expect(computeItemPersonShares(item).get("A")).toBe(15000);
  });

  it("splits proportionally to each person's quantity when equalQuantities is set (e.g. 2/1/3 glasses of ice tea)", () => {
    const item: Item = {
      id: "i",
      name: "Ice Tea",
      price: 60000,
      quantity: 1,
      mode: "equal",
      equalPersonIds: ["A", "B", "C"],
      equalQuantities: [
        { personId: "A", quantity: 2 },
        { personId: "B", quantity: 1 },
        { personId: "C", quantity: 3 },
      ],
    };
    const shares = computeItemPersonShares(item);
    expect(shares.get("A")).toBe(20000);
    expect(shares.get("B")).toBe(10000);
    expect(shares.get("C")).toBe(30000);
  });

  it("defaults to a weight of 1 for anyone in equalPersonIds without an explicit quantity", () => {
    const item: Item = {
      id: "i",
      name: "x",
      price: 90,
      quantity: 1,
      mode: "equal",
      equalPersonIds: ["A", "B", "C"],
      equalQuantities: [{ personId: "A", quantity: 2 }],
    };
    // A gets weight 2, B and C default to weight 1 each -> 45/22.5/22.5 rounded via largest remainder
    const shares = computeItemPersonShares(item);
    expect(shares.get("A")).toBe(45);
    expect((shares.get("B") ?? 0) + (shares.get("C") ?? 0)).toBe(45);
  });
});

describe("Per-item discount", () => {
  it("itemDiscountAmount computes a percent discount off the item total", () => {
    const item: Item = { id: "i", name: "x", price: 50000, quantity: 1, mode: "equal", discount: { valueType: "percent", value: 20 } };
    expect(itemDiscountAmount(item)).toBe(10000);
    expect(itemNetTotal(item)).toBe(40000);
  });

  it("itemDiscountAmount supports a fixed discount", () => {
    const item: Item = { id: "i", name: "x", price: 50000, quantity: 1, mode: "equal", discount: { valueType: "fixed", value: 15000 } };
    expect(itemDiscountAmount(item)).toBe(15000);
    expect(itemNetTotal(item)).toBe(35000);
  });

  it("clamps a fixed discount so the net total never goes below zero", () => {
    const item: Item = { id: "i", name: "x", price: 10000, quantity: 1, mode: "equal", discount: { valueType: "fixed", value: 99000 } };
    expect(itemDiscountAmount(item)).toBe(10000);
    expect(itemNetTotal(item)).toBe(0);
  });

  it("applies to the full line including quantity", () => {
    const item: Item = {
      id: "i",
      name: "x",
      price: 10000,
      quantity: 3,
      mode: "equal",
      discount: { valueType: "percent", value: 10 },
    };
    expect(itemTotal(item)).toBe(30000);
    expect(itemNetTotal(item)).toBe(27000);
  });

  it("no discount field means no discount", () => {
    const item: Item = { id: "i", name: "x", price: 40000, quantity: 1, mode: "equal" };
    expect(itemDiscountAmount(item)).toBe(0);
    expect(itemNetTotal(item)).toBe(itemTotal(item));
  });

  it("computeItemPersonShares splits the net (discounted) total, not the gross total", () => {
    const item: Item = {
      id: "takoyaki",
      name: "Takoyaki",
      price: 40000,
      quantity: 1,
      mode: "units",
      totalUnits: 8,
      discount: { valueType: "percent", value: 50 }, // net 20,000
      unitAssignments: [
        { personId: "A", units: 2 },
        { personId: "B", units: 3 },
        { personId: "C", units: 3 },
      ],
    };
    const shares = computeItemPersonShares(item);
    expect(shares.get("A")).toBe(5000);
    expect(shares.get("B")).toBe(7500);
    expect(shares.get("C")).toBe(7500);
  });

  it("flows through computeBillResult so billSubtotal reflects discounted items", () => {
    const bill = baseBill({
      people: [A, B],
      items: [
        {
          id: "1",
          name: "Discounted item",
          price: 50000,
          quantity: 1,
          mode: "equal",
          equalPersonIds: ["A", "B"],
          discount: { valueType: "percent", value: 20 },
        },
      ],
    });
    const result = computeBillResult(bill);
    expect(result.billSubtotal).toBe(40000);
    expect(result.perPerson.reduce((sum, p) => sum + p.total, 0)).toBe(result.grandTotal);
  });
});

describe("Rule 2 — billSubtotal equals sum of item totals", () => {
  it("holds across mixed modes and fixture bills", () => {
    const bill = baseBill({
      items: [
        { id: "1", name: "Nasi Goreng", price: 25000, quantity: 1, mode: "equal", equalPersonIds: ["A"] },
        { id: "2", name: "Iced Tea", price: 10000, quantity: 2, mode: "equal", equalPersonIds: ["A", "B", "C"] },
        {
          id: "3",
          name: "Takoyaki",
          price: 40000,
          quantity: 1,
          mode: "units",
          totalUnits: 8,
          unitAssignments: [
            { personId: "A", units: 2 },
            { personId: "B", units: 3 },
            { personId: "C", units: 3 },
          ],
        },
      ],
    });
    const expectedItemTotal = 25000 + 10000 * 2 + 40000;
    const result = computeBillResult(bill);
    expect(result.billSubtotal).toBe(expectedItemTotal);
  });
});

describe("Feature B — Charges (PRD §5.2 acceptance test)", () => {
  it("Subtotal 100,000 (A=40,000 B=60,000), Tax 11% + Delivery fixed 10,000 -> A=48,400 B=72,600 total=121,000", () => {
    const bill = baseBill({
      people: [A, B],
      items: [
        { id: "1", name: "A's food", price: 40000, quantity: 1, mode: "equal", equalPersonIds: ["A"] },
        { id: "2", name: "B's food", price: 60000, quantity: 1, mode: "equal", equalPersonIds: ["B"] },
      ],
      charges: [
        { id: "tax", label: "Tax", kind: "charge", valueType: "percent", value: 11 },
        { id: "delivery", label: "Delivery", kind: "charge", valueType: "fixed", value: 10000 },
      ],
    });
    const result = computeBillResult(bill);
    const aTotal = result.perPerson.find((p) => p.personId === "A")!.total;
    const bTotal = result.perPerson.find((p) => p.personId === "B")!.total;
    expect(aTotal).toBe(48400);
    expect(bTotal).toBe(72600);
    expect(result.grandTotal).toBe(121000);
  });

  it("percent + fixed + discount reconciles exactly to the receipt total", () => {
    const bill = baseBill({
      people: [A, B, C],
      items: [
        { id: "1", name: "Item", price: 30000, quantity: 1, mode: "equal", equalPersonIds: ["A"] },
        { id: "2", name: "Item", price: 45000, quantity: 1, mode: "equal", equalPersonIds: ["B"] },
        { id: "3", name: "Item", price: 25000, quantity: 1, mode: "equal", equalPersonIds: ["C"] },
      ],
      charges: [
        { id: "svc", label: "Service", kind: "charge", valueType: "percent", value: 5 },
        { id: "tax", label: "Tax", kind: "charge", valueType: "percent", value: 11 },
        { id: "delivery", label: "Delivery", kind: "charge", valueType: "fixed", value: 8000 },
        { id: "promo", label: "Promo", kind: "discount", valueType: "percent", value: 10 },
      ],
    });
    const result = computeBillResult(bill);
    const sumOfTotals = result.perPerson.reduce((a, p) => a + p.total, 0);
    expect(sumOfTotals).toBe(result.grandTotal);

    // exact receipt total, computed independently of the engine
    const subtotal = 30000 + 45000 + 25000;
    const svc = subtotal * 0.05;
    const tax = subtotal * 0.11;
    const delivery = 8000;
    const promo = -(subtotal * 0.1);
    const exactGrand = subtotal + svc + tax + delivery + promo;
    expect(result.grandTotal).toBe(roundHalfUp(exactGrand, 1));
  });

  it("every percent charge is based on the original subtotal, not a running total (no compounding)", () => {
    const bill = baseBill({
      people: [A, B],
      items: [{ id: "1", name: "Item", price: 100000, quantity: 1, mode: "equal", equalPersonIds: ["A", "B"] }],
      charges: [
        { id: "svc", label: "Service", kind: "charge", valueType: "percent", value: 10 }, // 10% of 100,000 = 10,000
        { id: "tax", label: "Tax", kind: "charge", valueType: "percent", value: 10 }, // also 10% of 100,000 = 10,000 (not 10% of 110,000)
      ],
    });
    const result = computeBillResult(bill);
    expect(result.chargesTotal).toBe(20000);
    expect(result.grandTotal).toBe(120000);
  });

  it("distributes charges proportionally to each person's pre-charge subtotal share", () => {
    const bill = baseBill({
      people: [A, B],
      items: [
        { id: "1", name: "Item", price: 40000, quantity: 1, mode: "equal", equalPersonIds: ["A"] },
        { id: "2", name: "Item", price: 60000, quantity: 1, mode: "equal", equalPersonIds: ["B"] },
      ],
      charges: [{ id: "delivery", label: "Delivery", kind: "charge", valueType: "fixed", value: 10000 }],
    });
    const result = computeBillResult(bill);
    const a = result.perPerson.find((p) => p.personId === "A")!;
    const b = result.perPerson.find((p) => p.personId === "B")!;
    expect(a.chargeLines[0].share).toBeCloseTo(4000);
    expect(b.chargeLines[0].share).toBeCloseTo(6000);
  });

  it("billSubtotal === 0 edge case distributes charges equally among all people", () => {
    const bill = baseBill({
      people: [A, B],
      items: [],
      charges: [{ id: "fee", label: "Flat fee", kind: "charge", valueType: "fixed", value: 10000 }],
    });
    const result = computeBillResult(bill);
    const a = result.perPerson.find((p) => p.personId === "A")!;
    const b = result.perPerson.find((p) => p.personId === "B")!;
    expect(a.total).toBe(5000);
    expect(b.total).toBe(5000);
  });
});

describe("Rounding (PRD §10 rule 5 & 6)", () => {
  it("round half up to the nearest roundingUnit (positive)", () => {
    expect(roundHalfUp(48450, 100)).toBe(48500);
    expect(roundHalfUp(48449, 100)).toBe(48400);
  });

  it("round half away from zero for negative values", () => {
    expect(roundHalfUp(-450, 100)).toBe(-500);
    expect(roundHalfUp(-449, 100)).toBe(-400);
  });

  it("supports roundingUnit 500 for IDR-style cash rounding", () => {
    expect(roundHalfUp(48250, 500)).toBe(48500);
    expect(roundHalfUp(48249, 500)).toBe(48000);
  });

  it("no floating point artifacts: every displayed total is an integer", () => {
    const bill = baseBill({
      people: [A, B, C],
      items: [{ id: "1", name: "Item", price: 100000, quantity: 1, mode: "equal", equalPersonIds: ["A", "B", "C"] }],
      charges: [{ id: "tax", label: "Tax", kind: "charge", valueType: "percent", value: 11.5 }],
    });
    const result = computeBillResult(bill);
    for (const p of result.perPerson) {
      expect(Number.isInteger(p.total)).toBe(true);
    }
    expect(Number.isInteger(result.grandTotal)).toBe(true);
  });

  it("invariant: sum of displayed person totals equals the exact receipt grand total (rounded)", () => {
    const bill = baseBill({
      people: [A, B, C],
      items: [
        { id: "1", name: "Item", price: 33333, quantity: 1, mode: "equal", equalPersonIds: ["A", "B", "C"] },
        { id: "2", name: "Item", price: 17777, quantity: 1, mode: "equal", equalPersonIds: ["A"] },
      ],
      charges: [
        { id: "tax", label: "Tax", kind: "charge", valueType: "percent", value: 11 },
        { id: "svc", label: "Service", kind: "charge", valueType: "percent", value: 6.5 },
        { id: "disc", label: "Discount", kind: "discount", valueType: "fixed", value: 5000 },
      ],
    });
    const result = computeBillResult(bill);
    const sum = result.perPerson.reduce((a, p) => a + p.total, 0);
    expect(sum).toBe(result.grandTotal);
  });

  it("never redistributes rounding onto the payer — each person keeps their own independently-rounded total", () => {
    // Mie Goreng: Rp56,000/portion x3, split 2:1 between A and B (Rp112,000 / Rp56,000),
    // plus a flat Rp12,000 tax and a flat Rp16,800 discount, both split proportionally.
    // A's exact total is 108,800 and B's is 54,400 — neither is a multiple of the
    // Rp500 rounding unit, so each rounds independently (109,000 / 54,500) and the
    // grand total is just their sum, with no adjustment nudging the payer's line.
    const bill = baseBill({
      people: [A, B],
      payerId: "A",
      currency: { symbol: "Rp", roundingUnit: 500 },
      items: [
        {
          id: "1",
          name: "Mie Goreng",
          price: 56000,
          quantity: 3,
          mode: "equal",
          equalPersonIds: ["A", "B"],
          equalQuantities: [
            { personId: "A", quantity: 2 },
            { personId: "B", quantity: 1 },
          ],
        },
      ],
      charges: [
        { id: "tax", label: "Pajak", kind: "charge", valueType: "fixed", value: 12000 },
        { id: "disc", label: "Promo", kind: "discount", valueType: "fixed", value: 16800 },
      ],
    });
    const result = computeBillResult(bill);
    const a = result.perPerson.find((p) => p.personId === "A")!;
    const b = result.perPerson.find((p) => p.personId === "B")!;
    expect(a.total).toBe(109000);
    expect(b.total).toBe(54500);
    expect(result.grandTotal).toBe(a.total + b.total);
    expect(result.grandTotal).toBe(163500);
  });
});

describe("personHasAssignments", () => {
  it("detects a person referenced in any assignment mode", () => {
    const bill = baseBill({
      items: [
        { id: "1", name: "x", price: 1000, quantity: 1, mode: "equal", equalPersonIds: ["A"] },
        {
          id: "2",
          name: "y",
          price: 1000,
          quantity: 1,
          mode: "units",
          totalUnits: 2,
          unitAssignments: [{ personId: "B", units: 2 }],
        },
      ],
    });
    expect(personHasAssignments(bill, "A")).toBe(true);
    expect(personHasAssignments(bill, "B")).toBe(true);
    expect(personHasAssignments(bill, "C")).toBe(false);
  });
});

describe("validateBill", () => {
  it("requires at least 2 people", () => {
    const bill = baseBill({ people: [A] });
    const v = validateBill(bill);
    expect(v.valid).toBe(false);
    expect(v.issues.some((i) => i.level === "error")).toBe(true);
  });

  it("blocks on over-assigned units, warns (non-blocking) on under-assigned units", () => {
    const under = baseBill({
      items: [
        {
          id: "1",
          name: "x",
          price: 1000,
          quantity: 1,
          mode: "units",
          totalUnits: 4,
          unitAssignments: [{ personId: "A", units: 2 }],
        },
      ],
    });
    const underResult = validateBill(under);
    expect(underResult.valid).toBe(true);
    expect(underResult.issues.some((i) => i.level === "warning")).toBe(true);

    const over = baseBill({
      items: [
        {
          id: "1",
          name: "x",
          price: 1000,
          quantity: 1,
          mode: "units",
          totalUnits: 4,
          unitAssignments: [{ personId: "A", units: 5 }],
        },
      ],
    });
    expect(validateBill(over).valid).toBe(false);
  });

  it("blocks equal-mode items with no one selected", () => {
    const bill = baseBill({ items: [{ id: "1", name: "x", price: 1000, quantity: 1, mode: "equal" }] });
    expect(validateBill(bill).valid).toBe(false);
  });

  it("blocks items with no price entered yet", () => {
    const bill = baseBill({
      items: [{ id: "1", name: "x", price: 0, quantity: 1, mode: "equal", equalPersonIds: ["A", "B"] }],
    });
    expect(validateBill(bill).valid).toBe(false);
  });

  it("passes for a fully valid bill", () => {
    const bill = baseBill({
      items: [{ id: "1", name: "x", price: 1000, quantity: 1, mode: "equal", equalPersonIds: ["A", "B"] }],
    });
    expect(validateBill(bill).valid).toBe(true);
  });
});
