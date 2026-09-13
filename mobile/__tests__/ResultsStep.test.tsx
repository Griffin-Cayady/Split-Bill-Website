import { render, screen } from "@testing-library/react-native";
import { ResultsStep } from "@/features/results/ResultsStep";
import { useBillStore } from "@/store/billStore";

describe("ResultsStep", () => {
  it("guards when there is nothing to show", async () => {
    useBillStore.getState().resetBill();
    await render(<ResultsStep />);
    expect(screen.getByText("Back to People")).toBeTruthy();
  });

  it("renders a card per person and the grand total", async () => {
    const s = useBillStore.getState();
    s.resetBill();
    s.setCurrency({ symbol: "Rp", roundingUnit: 1 });
    s.addPerson("A");
    s.addPerson("B");
    const [a, b] = useBillStore.getState().bill.people;
    s.addItem({ name: "Food", price: 100000, mode: "equal", equalPersonIds: [a.id, b.id] });
    s.addCharge({ label: "Tax", valueType: "percent", value: 10 });
    await render(<ResultsStep />);
    expect(screen.getByText("A")).toBeTruthy();
    expect(screen.getByText("B")).toBeTruthy();
    expect(screen.getByText("Rp 110.000")).toBeTruthy();
    expect(screen.getAllByText("Rp 55.000")).toHaveLength(2);
  });
});
