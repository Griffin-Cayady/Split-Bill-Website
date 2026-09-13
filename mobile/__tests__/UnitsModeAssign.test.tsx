import { fireEvent, render, screen } from "@testing-library/react-native";
import { UnitsModeAssign } from "@/features/items/UnitsModeAssign";
import { useBillStore } from "@/store/billStore";

function seed(units: { a: number; b: number }, totalUnits = 8) {
  const s = useBillStore.getState();
  s.resetBill();
  s.setCurrency({ symbol: "Rp", roundingUnit: 1 });
  s.addPerson("Ana");
  s.addPerson("Ben");
  const [a, b] = useBillStore.getState().bill.people;
  const id = s.addItem({
    name: "Takoyaki",
    price: 40000,
    mode: "units",
    totalUnits,
    unitAssignments: [
      { personId: a.id, units: units.a },
      { personId: b.id, units: units.b },
    ],
  });
  return () => useBillStore.getState().bill.items.find((i) => i.id === id)!;
}

describe("UnitsModeAssign", () => {
  it("shows the under-assigned banner and splits the remainder", async () => {
    const item = seed({ a: 2, b: 3 });
    await render(<UnitsModeAssign item={item()} />);
    expect(screen.getByText("3 of 8 pieces left to assign")).toBeTruthy();
    await fireEvent.press(screen.getByText("Split remaining 3 equally"));
    const total = item().unitAssignments!.reduce((sum, u) => sum + u.units, 0);
    expect(total).toBe(8);
  });

  it("shows over and exact states", async () => {
    const over = seed({ a: 5, b: 5 });
    const r = await render(<UnitsModeAssign item={over()} />);
    expect(screen.getByText(/Too many/)).toBeTruthy();
    const exact = seed({ a: 4, b: 4 });
    await r.rerender(<UnitsModeAssign item={exact()} />);
    expect(screen.getByText("✓ All 8 pieces assigned")).toBeTruthy();
  });

  it("asks for total pieces when none set", async () => {
    const item = seed({ a: 0, b: 0 }, 0);
    await render(<UnitsModeAssign item={item()} />);
    expect(screen.getByText("Set how many pieces there are in total")).toBeTruthy();
  });
});
