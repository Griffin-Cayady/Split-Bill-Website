import type { Item, Bill, BillResult, PersonResult, BillValidation, BillValidationIssue, UnitsValidation } from "./types";

const EPSILON = 1e-6;

/** Whether a person appears in any item's assignment, regardless of mode. */
export function personHasAssignments(bill: Bill, personId: string): boolean {
  return bill.items.some(
    (item) => item.equalPersonIds?.includes(personId) || item.unitAssignments?.some((u) => u.personId === personId),
  );
}

export function itemTotal(item: Item): number {
  return item.price * item.quantity;
}

/** The gross amount knocked off an item's total by its own discount (0 if none), clamped so it never exceeds the item total. */
export function itemDiscountAmount(item: Item): number {
  if (!item.discount) return 0;
  const total = itemTotal(item);
  const raw = item.discount.valueType === "percent" ? (total * item.discount.value) / 100 : item.discount.value;
  return Math.min(Math.max(raw, 0), total);
}

/** What actually gets split among participants: the item total minus its own discount. */
export function itemNetTotal(item: Item): number {
  return Math.round(itemTotal(item) - itemDiscountAmount(item));
}

/**
 * Splits an integer `total` across `weights` proportionally using the
 * largest-remainder method, so the results always sum to exactly `total`
 * with no fractional leftover — this is what keeps item-level shares free
 * of floating-point dust.
 */
export function allocateInteger(total: number, weights: number[]): number[] {
  if (weights.length === 0) return [];
  const sumWeights = weights.reduce((a, b) => a + b, 0);
  if (sumWeights <= 0) {
    return allocateInteger(
      total,
      weights.map(() => 1),
    );
  }
  const raw = weights.map((w) => (total * w) / sumWeights);
  const floors = raw.map((r) => Math.floor(r));
  const allocated = floors.reduce((a, b) => a + b, 0);
  const remainder = Math.round(total - allocated);
  const order = raw
    .map((r, i) => ({ i, frac: r - floors[i] }))
    .sort((a, b) => b.frac - a.frac);
  const result = [...floors];
  for (let k = 0; k < remainder; k++) {
    result[order[k % order.length].i] += 1;
  }
  return result;
}

/** Per-item person shares, dispatched on the item's assignment mode. Splits the net (post item-discount) total. */
export function computeItemPersonShares(item: Item): Map<string, number> {
  const total = itemNetTotal(item);
  const shares = new Map<string, number>();

  switch (item.mode) {
    case "equal": {
      const ids = item.equalPersonIds ?? [];
      if (ids.length === 0) break;
      const quantities = item.equalQuantities ?? [];
      // Defaults to a weight of 1 per included person, so an item with no
      // explicit quantities behaves exactly like a plain equal split.
      const weights = ids.map((id) => quantities.find((q) => q.personId === id)?.quantity ?? 1);
      const amounts = allocateInteger(total, weights);
      ids.forEach((id, i) => shares.set(id, (shares.get(id) ?? 0) + amounts[i]));
      break;
    }
    case "units": {
      const assignments = item.unitAssignments ?? [];
      const totalUnits = item.totalUnits ?? 0;
      if (assignments.length === 0 || totalUnits <= 0) break;
      const assignedUnits = assignments.reduce((a, b) => a + b.units, 0);
      // Denominator is always totalUnits (price-per-unit = total / totalUnits),
      // so a fully-assigned item reconciles exactly to the item total.
      const targetSum = Math.round((total * Math.min(assignedUnits, totalUnits)) / totalUnits);
      const amounts = allocateInteger(
        targetSum,
        assignments.map((a) => a.units),
      );
      assignments.forEach((a, i) => shares.set(a.personId, (shares.get(a.personId) ?? 0) + amounts[i]));
      break;
    }
  }

  return shares;
}

export function validateUnitsAssignment(item: Item): UnitsValidation {
  const total = item.totalUnits ?? 0;
  const assigned = (item.unitAssignments ?? []).reduce((a, b) => a + b.units, 0);
  const remaining = total - assigned;
  let status: UnitsValidation["status"] = "exact";
  if (remaining > EPSILON) status = "under";
  else if (remaining < -EPSILON) status = "over";
  return { status, assigned, total, remaining };
}

/**
 * "Split remainder equally" — distributes the unassigned units of a units-mode
 * item evenly across the people who already have an assignment entry on it.
 * Pure: returns a new Item, does not mutate the input.
 */
export function distributeRemainderEqually(item: Item): Item {
  const assignments = item.unitAssignments ?? [];
  if (assignments.length === 0) return item;
  const { remaining } = validateUnitsAssignment(item);
  if (remaining <= EPSILON) return item;

  // Round to 2 decimals at each step to avoid float dust re-triggering the
  // under-assigned check (fractional units are allowed, but not float dust).
  const share = Math.round((remaining / assignments.length) * 100) / 100;
  const nextAssignments = assignments.map((a, i) => {
    const isLast = i === assignments.length - 1;
    const addition = isLast ? Math.round((remaining - share * i) * 100) / 100 : share;
    return { ...a, units: Math.round((a.units + addition) * 100) / 100 };
  });
  return { ...item, unitAssignments: nextAssignments };
}

export function validateBill(bill: Bill): BillValidation {
  const issues: BillValidationIssue[] = [];

  if (bill.people.length < 2) {
    issues.push({ level: "error", message: "Add at least 2 people to split the bill." });
  }

  for (const item of bill.items) {
    const name = item.name.trim() ? `"${item.name.trim()}"` : "An unnamed item";
    if (item.price <= 0) {
      issues.push({ level: "error", itemId: item.id, message: `${name} needs a price.` });
    }

    switch (item.mode) {
      case "equal":
        if (!item.equalPersonIds || item.equalPersonIds.length === 0) {
          issues.push({ level: "error", itemId: item.id, message: `${name} needs at least one person.` });
        }
        break;
      case "units": {
        const v = validateUnitsAssignment(item);
        if (v.total <= 0) {
          issues.push({ level: "error", itemId: item.id, message: `${name} needs a total number of pieces.` });
        } else if ((item.unitAssignments ?? []).length === 0) {
          issues.push({ level: "error", itemId: item.id, message: `${name} needs at least one person.` });
        } else if (v.status === "over") {
          issues.push({
            level: "error",
            itemId: item.id,
            message: `${name} has ${v.assigned} pieces assigned but only ${v.total} exist.`,
          });
        } else if (v.status === "under") {
          // Blocking, not a warning: unassigned pieces drop out of everyone's
          // total, so the payer would silently cover the gap.
          issues.push({
            level: "error",
            itemId: item.id,
            message: `${name} has ${v.remaining} of ${v.total} pieces nobody is paying for.`,
          });
        }
        break;
      }
    }
  }

  const valid = !issues.some((i) => i.level === "error");
  return { valid, issues };
}

/** Round half away from zero (so negative discount-heavy totals round sensibly too). */
export function roundHalfUp(value: number, unit: 1 | 100 | 500): number {
  const scaled = value / unit;
  const rounded = value >= 0 ? Math.floor(scaled + 0.5) : Math.ceil(scaled - 0.5);
  return rounded * unit;
}

export function computeBillResult(bill: Bill): BillResult {
  const { people, items, charges, currency } = bill;

  const personSubtotals = new Map<string, number>();
  const personItemLines = new Map<string, PersonResult["itemLines"]>();
  people.forEach((p) => {
    personSubtotals.set(p.id, 0);
    personItemLines.set(p.id, []);
  });

  for (const item of items) {
    const shares = computeItemPersonShares(item);
    for (const [personId, share] of shares) {
      if (!personSubtotals.has(personId)) continue; // ignore stale refs to removed people
      personSubtotals.set(personId, (personSubtotals.get(personId) ?? 0) + share);
      personItemLines.get(personId)!.push({ itemId: item.id, label: item.name, share });
    }
  }

  const billSubtotal = Array.from(personSubtotals.values()).reduce((a, b) => a + b, 0);

  const personChargeLines = new Map<string, PersonResult["chargeLines"]>();
  const personChargeTotals = new Map<string, number>();
  people.forEach((p) => {
    personChargeLines.set(p.id, []);
    personChargeTotals.set(p.id, 0);
  });

  let chargesTotal = 0;

  for (const charge of charges) {
    const magnitude = charge.valueType === "percent" ? (billSubtotal * charge.value) / 100 : charge.value;
    const chargeAmount = charge.kind === "discount" ? -magnitude : magnitude;

    chargesTotal += chargeAmount;

    if (billSubtotal === 0) {
      const equalShare = people.length > 0 ? chargeAmount / people.length : 0;
      for (const p of people) {
        personChargeTotals.set(p.id, (personChargeTotals.get(p.id) ?? 0) + equalShare);
        personChargeLines.get(p.id)!.push({ chargeId: charge.id, label: charge.label, share: equalShare });
      }
    } else {
      for (const p of people) {
        const personSubtotal = personSubtotals.get(p.id) ?? 0;
        const share = (chargeAmount * personSubtotal) / billSubtotal;
        personChargeTotals.set(p.id, (personChargeTotals.get(p.id) ?? 0) + share);
        personChargeLines.get(p.id)!.push({ chargeId: charge.id, label: charge.label, share });
      }
    }
  }

  const roundingUnit = currency.roundingUnit;

  const perPerson: PersonResult[] = people.map((p) => {
    const subtotal = personSubtotals.get(p.id) ?? 0;
    const rawTotal = subtotal + (personChargeTotals.get(p.id) ?? 0);
    const total = roundHalfUp(rawTotal, roundingUnit);
    return {
      personId: p.id,
      itemLines: personItemLines.get(p.id) ?? [],
      chargeLines: personChargeLines.get(p.id) ?? [],
      subtotal,
      total,
    };
  });

  // The grand total is simply the sum of each person's own (independently
  // rounded) total — nobody's total gets silently nudged to reconcile
  // against a separately-rounded whole-bill figure.
  const grandTotal = perPerson.reduce((a, p) => a + p.total, 0);

  return { perPerson, billSubtotal, chargesTotal, grandTotal };
}

export type BillReconciliation = {
  /** Sum of every item's net total — what the receipt lists before extras. */
  itemsTotal: number;
  /** Item value assigned to nobody (0 once every item is fully split). */
  unassigned: number;
  /** Tax, service, tip and bill-level discounts, as split across people. */
  chargesTotal: number;
  /** Each charge's signed amount (discounts negative), in bill order. */
  chargeAmounts: { chargeId: string; amount: number }[];
  /** Net effect of rounding each person's total to the currency's rounding unit. */
  roundingAdjustment: number;
  grandTotal: number;
};

/**
 * Reconciles the per-person split against the receipt, so the UI can show
 * that everything adds up — or exactly how much is missing. The parts always
 * satisfy: (itemsTotal − unassigned) + chargesTotal + roundingAdjustment = grandTotal.
 */
export function reconcileBill(bill: Bill, result: BillResult = computeBillResult(bill)): BillReconciliation {
  const itemsTotal = bill.items.reduce((a, item) => a + itemNetTotal(item), 0);
  const chargeAmounts = bill.charges.map((c) => ({
    chargeId: c.id,
    amount: Math.round(
      result.perPerson.reduce((a, p) => a + (p.chargeLines.find((l) => l.chargeId === c.id)?.share ?? 0), 0),
    ),
  }));
  const chargesTotal = chargeAmounts.reduce((a, c) => a + c.amount, 0);
  return {
    itemsTotal,
    unassigned: Math.max(0, itemsTotal - result.billSubtotal),
    chargesTotal,
    chargeAmounts,
    roundingAdjustment: result.grandTotal - result.billSubtotal - chargesTotal,
    grandTotal: result.grandTotal,
  };
}
