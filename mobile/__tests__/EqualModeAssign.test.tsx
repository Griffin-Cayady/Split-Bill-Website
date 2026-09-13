import { fireEvent, render, screen } from "@testing-library/react-native";
import { EqualModeAssign } from "@/features/items/EqualModeAssign";
import { useBillStore } from "@/store/billStore";

function seed() {
  const s = useBillStore.getState();
  s.resetBill();
  s.addPerson("Ana");
  s.addPerson("Ben");
  const id = s.addItem({ name: "Tea", price: 1000 });
  return () => useBillStore.getState().bill.items.find((i) => i.id === id)!;
}

describe("EqualModeAssign", () => {
  it("includes a person when their quantity goes above 0 and excludes at 0", async () => {
    const item = seed();
    const ana = useBillStore.getState().bill.people[0];
    const r = await render(<EqualModeAssign item={item()} />);
    await fireEvent.press(screen.getByLabelText("Increase quantity for Ana"));
    expect(item().equalPersonIds).toEqual([ana.id]);
    expect(item().equalQuantities).toEqual([{ personId: ana.id, quantity: 1 }]);

    await r.rerender(<EqualModeAssign item={item()} />);
    await fireEvent.press(screen.getByLabelText("Decrease quantity for Ana"));
    expect(item().equalPersonIds).toEqual([]);
    expect(item().equalQuantities).toEqual([]);
  });
});
