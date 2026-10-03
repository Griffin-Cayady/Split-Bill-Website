import { describe, expect, it } from "vitest";
import type { StateCreator } from "zustand";
import { billPersistOptions, createDefaultBill, type BillStore } from "./billStoreCore";

describe("billPersistOptions.migrate", () => {
  it("repairs a legacy single-mode item into equal mode", () => {
    const legacy = {
      bill: {
        ...createDefaultBill(),
        items: [{ id: "i1", name: "Tea", price: 100, quantity: 1, mode: "single", singlePersonId: "A" }],
      },
    };
    const out = billPersistOptions.migrate!(legacy, 1) as { bill: { items: { mode: string; equalPersonIds?: string[] }[] } };
    expect(out.bill.items[0].mode).toBe("equal");
    expect(out.bill.items[0].equalPersonIds).toEqual(["A"]);
  });

  it("returns non-object input unchanged", () => {
    expect(billPersistOptions.migrate!(null, 1)).toBeNull();
    expect(billPersistOptions.migrate!("junk", 1)).toBe("junk");
  });

  it("has the same storage key and version the website has always used", () => {
    expect(billPersistOptions.name).toBe("spliteasy.bill.v1");
    expect(billPersistOptions.version).toBe(2);
  });
});

describe("setPayer", () => {
  it("sets the payer and clears a stale settled flag on them", async () => {
    const { create } = await import("zustand");
    const { billStoreInitializer } = await import("./billStoreCore");
    // The initializer is typed for the persist middleware; it never touches persist APIs itself.
    const store = create<BillStore>()(billStoreInitializer as unknown as StateCreator<BillStore>);
    store.getState().addPerson("Ana");
    store.getState().addPerson("Budi");
    const budi = store.getState().bill.people[1];
    store.getState().togglePersonPaid(budi.id);
    store.getState().setPayer(budi.id);
    expect(store.getState().bill.payerId).toBe(budi.id);
    expect(store.getState().bill.people[1].paid).toBe(false);
  });
});
