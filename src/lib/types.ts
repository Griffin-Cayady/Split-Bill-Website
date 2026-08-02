export type Currency = { symbol: string; roundingUnit: 1 | 100 | 500 };

export type Person = { id: string; name: string; color: string; paid?: boolean };

export type AssignmentMode = "equal" | "units";

export type ItemDiscount = {
  valueType: "percent" | "fixed";
  value: number; // percent as e.g. 11.5, fixed as integer amount
};

export type Item = {
  id: string;
  name: string;
  price: number; // integer, smallest currency unit, per single quantity
  quantity: number; // >= 1
  mode: AssignmentMode;
  discount?: ItemDiscount; // reduces this item's total before it's split among participants
  // mode-specific:
  equalPersonIds?: string[]; // mode = equal
  equalQuantities?: { personId: string; quantity: number }[]; // mode = equal; per-person weight, defaults to 1 for any id in equalPersonIds without an entry here
  totalUnits?: number; // mode = units (per full item incl. quantity)
  unitAssignments?: { personId: string; units: number }[]; // mode = units
};

export type Charge = {
  id: string;
  label: string;
  kind: "charge" | "discount";
  valueType: "percent" | "fixed";
  value: number; // percent as e.g. 11.5, fixed as integer amount
};

export type Bill = {
  version: 1;
  title: string;
  dateISO: string;
  currency: Currency;
  payerId?: string; // who paid; others settle up with them
  people: Person[];
  items: Item[];
  charges: Charge[];
};

export type PersonResult = {
  personId: string;
  itemLines: { itemId: string; label: string; share: number }[];
  chargeLines: { chargeId: string; label: string; share: number }[];
  subtotal: number;
  total: number; // rounded
};

export type BillResult = {
  perPerson: PersonResult[];
  billSubtotal: number;
  chargesTotal: number;
  grandTotal: number; // sum of perPerson totals — each person's own rounded amount, no cross-person adjustment
};

export type ValidationIssueLevel = "warning" | "error";

export type BillValidationIssue = {
  level: ValidationIssueLevel;
  itemId?: string;
  message: string;
};

export type BillValidation = {
  valid: boolean; // true if no blocking ("error") issues
  issues: BillValidationIssue[];
};

export type UnitsValidationStatus = "under" | "over" | "exact";

export type UnitsValidation = {
  status: UnitsValidationStatus;
  assigned: number;
  total: number;
  remaining: number;
};
