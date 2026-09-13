import { fireEvent, render, screen } from "@testing-library/react-native";
import { ChargesStep } from "@/features/charges/ChargesStep";
import { useBillStore } from "@/store/billStore";

/** PRD §5.2 acceptance example: 100,000 subtotal, tax 11 %, delivery 10,000 → 121,000. */
function seedPrdExample() {
  const s = useBillStore.getState();
  s.resetBill();
  s.setCurrency({ symbol: "Rp", roundingUnit: 1 });
  s.addPerson("A");
  s.addPerson("B");
  const [a, b] = useBillStore.getState().bill.people;
  s.addItem({ name: "A's food", price: 40000, mode: "equal", equalPersonIds: [a.id] });
  s.addItem({ name: "B's food", price: 60000, mode: "equal", equalPersonIds: [b.id] });
  s.addCharge({ label: "Tax", valueType: "percent", value: 11 });
  s.addCharge({ label: "Delivery", valueType: "fixed", value: 10000 });
}

describe("ChargesStep", () => {
  it("shows the empty state and adds a charge", async () => {
    useBillStore.getState().resetBill();
    await render(<ChargesStep />);
    expect(screen.getByText(/No extras/)).toBeTruthy();
    await fireEvent.press(screen.getByText("Add charge"));
    expect(useBillStore.getState().bill.charges).toHaveLength(1);
  });

  it("summarises subtotal, each charge and the grand total", async () => {
    seedPrdExample();
    await render(<ChargesStep />);
    expect(screen.getByText("Rp 100.000")).toBeTruthy();
    expect(screen.getByText("+Rp 11.000")).toBeTruthy();
    expect(screen.getByText("+Rp 10.000")).toBeTruthy();
    expect(screen.getByText("Rp 121.000")).toBeTruthy();
  });
});
