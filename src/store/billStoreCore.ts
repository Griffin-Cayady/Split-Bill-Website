import type { StateCreator } from "zustand";
import type { PersistOptions } from "zustand/middleware";
import type { AssignmentMode, Bill, Charge, Item, Person } from "../lib/types";
import { colorForIndex, generateId } from "../lib/id";
import { defaultCurrency } from "../lib/currency";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Schema v1 also had "single" and "custom" assignment modes (with
// singlePersonId / customShares fields) that were later dropped in favor of
// just equal/units. This repairs any such items still sitting in a user's
// localStorage (or an old shared link) into equal-mode, preserving who was
// already assigned, instead of crashing or silently dropping their data.
function migrateLegacyItem(item: Item & { singlePersonId?: string; customShares?: { personId: string }[] }): Item {
  if (item.mode === "equal" || item.mode === "units") return item;
  const equalPersonIds =
    item.equalPersonIds ??
    (item.singlePersonId ? [item.singlePersonId] : undefined) ??
    item.customShares?.map((c) => c.personId) ??
    [];
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    mode: "equal",
    equalPersonIds,
    equalQuantities: item.equalQuantities,
    totalUnits: item.totalUnits,
    unitAssignments: item.unitAssignments,
  };
}

export function createDefaultBill(): Bill {
  return {
    version: 1,
    title: `Split bill, ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
    dateISO: todayISO(),
    currency: defaultCurrency(),
    people: [],
    items: [],
    charges: [],
  };
}

export interface BillStore {
  bill: Bill;
  /** Wholesale replace — used to hydrate a shared link ("Edit a copy"). */
  loadBill: (bill: Bill) => void;
  resetBill: () => void;

  setTitle: (title: string) => void;
  setDateISO: (dateISO: string) => void;
  setCurrency: (currency: Bill["currency"]) => void;

  addPerson: (name: string) => void;
  updatePersonName: (id: string, name: string) => void;
  removePerson: (id: string) => void;
  togglePersonPaid: (id: string) => void;
  /** Who paid the bill; everyone else settles up with them. */
  setPayer: (id: string) => void;

  addItem: (partial?: Partial<Omit<Item, "id">>) => string;
  addItemAt: (item: Item, index: number) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  removeItem: (id: string) => void;
  setItemMode: (id: string, mode: AssignmentMode) => void;

  addCharge: (partial?: Partial<Omit<Charge, "id">>) => string;
  updateCharge: (id: string, patch: Partial<Charge>) => void;
  removeCharge: (id: string) => void;
}

type PersistedBillState = { bill: Bill };

/**
 * Platform-neutral store definition. Web wraps it with localStorage
 * (src/store/billStore.ts); mobile wraps it with AsyncStorage
 * (mobile/src/store/billStore.ts). Keep this file free of DOM/RN APIs.
 */
export const billStoreInitializer: StateCreator<BillStore, [["zustand/persist", unknown]], []> = (set) => ({
  bill: createDefaultBill(),

  loadBill: (bill) => set({ bill }),
  resetBill: () => set({ bill: createDefaultBill() }),

  setTitle: (title) => set((s) => ({ bill: { ...s.bill, title } })),
  setDateISO: (dateISO) => set((s) => ({ bill: { ...s.bill, dateISO } })),
  setCurrency: (currency) => set((s) => ({ bill: { ...s.bill, currency } })),

  addPerson: (name) =>
    set((s) => {
      const person: Person = { id: generateId(), name, color: colorForIndex(s.bill.people.length) };
      return { bill: { ...s.bill, people: [...s.bill.people, person] } };
    }),

  updatePersonName: (id, name) =>
    set((s) => ({
      bill: { ...s.bill, people: s.bill.people.map((p) => (p.id === id ? { ...p, name } : p)) },
    })),

  setPayer: (id) =>
    set((s) => ({
      // The payer has nothing to settle, so clear any stale "settled" flag on them.
      bill: { ...s.bill, payerId: id, people: s.bill.people.map((p) => (p.id === id && p.paid ? { ...p, paid: false } : p)) },
    })),

  togglePersonPaid: (id) =>
    set((s) => ({
      bill: { ...s.bill, people: s.bill.people.map((p) => (p.id === id ? { ...p, paid: !p.paid } : p)) },
    })),

  removePerson: (id) =>
    set((s) => {
      const people = s.bill.people.filter((p) => p.id !== id);
      const items = s.bill.items.map((item) => {
        const next = { ...item };
        if (next.equalPersonIds) next.equalPersonIds = next.equalPersonIds.filter((pid) => pid !== id);
        if (next.unitAssignments) next.unitAssignments = next.unitAssignments.filter((u) => u.personId !== id);
        return next;
      });
      const payerId = s.bill.payerId === id ? undefined : s.bill.payerId;
      return { bill: { ...s.bill, people, items, payerId } };
    }),

  addItem: (partial) => {
    const id = generateId();
    set((s) => {
      const item: Item = { id, name: "", price: 0, quantity: 1, mode: "equal", ...partial };
      return { bill: { ...s.bill, items: [...s.bill.items, item] } };
    });
    return id;
  },

  addItemAt: (item, index) =>
    set((s) => {
      const items = [...s.bill.items];
      items.splice(Math.min(index, items.length), 0, item);
      return { bill: { ...s.bill, items } };
    }),

  updateItem: (id, patch) =>
    set((s) => ({
      bill: { ...s.bill, items: s.bill.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) },
    })),

  removeItem: (id) =>
    set((s) => ({ bill: { ...s.bill, items: s.bill.items.filter((it) => it.id !== id) } })),

  setItemMode: (id, mode) =>
    set((s) => ({
      bill: { ...s.bill, items: s.bill.items.map((it) => (it.id === id ? { ...it, mode } : it)) },
    })),

  addCharge: (partial) => {
    const id = generateId();
    set((s) => {
      const charge: Charge = {
        id,
        label: "",
        kind: "charge",
        valueType: "percent",
        value: 0,
        ...partial,
      };
      return { bill: { ...s.bill, charges: [...s.bill.charges, charge] } };
    });
    return id;
  },

  updateCharge: (id, patch) =>
    set((s) => ({
      bill: { ...s.bill, charges: s.bill.charges.map((c) => (c.id === id ? { ...c, ...patch } : c)) },
    })),

  removeCharge: (id) =>
    set((s) => ({ bill: { ...s.bill, charges: s.bill.charges.filter((c) => c.id !== id) } })),
});

export const billPersistOptions: Omit<PersistOptions<BillStore, PersistedBillState>, "storage"> = {
  name: "spliteasy.bill.v1",
  version: 2,
  migrate: (persistedState) => {
    const state = persistedState as { bill?: Bill } | null;
    if (!state?.bill) return state as PersistedBillState;
    return { bill: { ...state.bill, items: (state.bill.items ?? []).map(migrateLegacyItem) } };
  },
  partialize: (state) => ({ bill: state.bill }),
};
