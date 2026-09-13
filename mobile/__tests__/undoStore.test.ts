import { useBillStore } from "@/store/billStore";
import { useUndoStore } from "@/features/items/undoStore";

describe("undoStore", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useBillStore.getState().resetBill();
    useUndoStore.getState().clear();
  });
  afterEach(() => jest.useRealTimers());

  it("restores a deleted item at its original index on undo", () => {
    const s = useBillStore.getState();
    const first = s.addItem({ name: "A" });
    s.addItem({ name: "B" });
    const item = useBillStore.getState().bill.items.find((i) => i.id === first)!;
    s.removeItem(first);
    useUndoStore.getState().schedule(item, 0);
    expect(useUndoStore.getState().pending?.item.name).toBe("A");
    useUndoStore.getState().undo();
    expect(useBillStore.getState().bill.items.map((i) => i.name)).toEqual(["A", "B"]);
    expect(useUndoStore.getState().pending).toBeNull();
  });

  it("expires after 5 seconds", () => {
    const s = useBillStore.getState();
    const id = s.addItem({ name: "A" });
    const item = useBillStore.getState().bill.items.find((i) => i.id === id)!;
    useUndoStore.getState().schedule(item, 0);
    jest.advanceTimersByTime(5000);
    expect(useUndoStore.getState().pending).toBeNull();
  });
});
