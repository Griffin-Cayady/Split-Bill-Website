import { beforeEach, describe, expect, it, vi } from "vitest";

const memory = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (k: string) => memory.get(k) ?? null,
  setItem: (k: string, v: string) => void memory.set(k, v),
  removeItem: (k: string) => void memory.delete(k),
});
vi.stubGlobal("crypto", { randomUUID: () => Math.random().toString(36).slice(2) });

const { useBillStore } = await import("./billStore");
const { useUIStore } = await import("./uiStore");
const { undoableBillChange } = await import("./undoableBillChange");

function undoToast() {
  return useUIStore.getState().toasts.find((t) => t.action);
}

describe("undoableBillChange", () => {
  beforeEach(() => {
    useBillStore.getState().resetBill();
    useUIStore.setState({ toasts: [] });
    useBillStore.getState().addPerson("Ana");
    useBillStore.getState().addPerson("Budi");
  });

  it("restores the exact previous bill on undo", () => {
    const before = useBillStore.getState().bill;
    undoableBillChange("Removed Ana", () => useBillStore.getState().removePerson(before.people[0].id));
    expect(useBillStore.getState().bill.people).toHaveLength(1);

    undoToast()!.action!.onAction();
    expect(useBillStore.getState().bill).toBe(before);
  });

  it("withdraws the undo once the bill changes again, so later edits are never overwritten", () => {
    const before = useBillStore.getState().bill;
    const onUndo = vi.fn();
    undoableBillChange("Bill cleared", () => useBillStore.getState().resetBill(), onUndo);
    const toast = undoToast()!;

    useBillStore.getState().addPerson("Cara");
    expect(undoToast()).toBeUndefined();

    toast.action!.onAction();
    expect(useBillStore.getState().bill).not.toBe(before);
    expect(useBillStore.getState().bill.people.map((p) => p.name)).toEqual(["Cara"]);
    expect(onUndo).not.toHaveBeenCalled();
  });
});
