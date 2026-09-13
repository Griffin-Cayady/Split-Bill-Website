import { renderHook } from "@testing-library/react-native";
import { useStepGate } from "@shared/hooks/useStepGate";
import { useUIStore } from "@shared/store/uiStore";
import { createDefaultBill } from "@shared/store/billStoreCore";
import type { Person } from "@shared/lib/types";

const person = (id: string): Person => ({ id, name: id, color: "#000" });

describe("useStepGate on the People step", () => {
  beforeEach(() => useUIStore.setState({ step: "people" }));

  it("blocks Next with 0 or 1 people and unblocks at 2", async () => {
    const bill = createDefaultBill();
    const zero = await renderHook(() => useStepGate(bill));
    expect(zero.result.current.relevantBlock).toBe(true);
    const one = await renderHook(() => useStepGate({ ...bill, people: [person("a")] }));
    expect(one.result.current.relevantBlock).toBe(true);
    const two = await renderHook(() => useStepGate({ ...bill, people: [person("a"), person("b")] }));
    expect(two.result.current.relevantBlock).toBe(false);
  });
});
