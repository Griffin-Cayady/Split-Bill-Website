import { fireEvent, render, screen } from "@testing-library/react-native";
import { ChargeRow } from "@/features/charges/ChargeRow";
import { useBillStore } from "@/store/billStore";

function seed(symbol = "$") {
  const s = useBillStore.getState();
  s.resetBill();
  s.setCurrency({ symbol, roundingUnit: 1 });
  const id = s.addCharge({ label: "Tax" });
  return () => useBillStore.getState().bill.charges.find((c) => c.id === id)!;
}

describe("ChargeRow", () => {
  it("stores percent values as typed and fixed values in smallest units", async () => {
    const charge = seed();
    const r = await render(<ChargeRow charge={charge()} />);
    await fireEvent.changeText(screen.getByLabelText("Charge value"), "11.5");
    await fireEvent(screen.getByLabelText("Charge value"), "blur");
    expect(charge().value).toBe(11.5);

    await fireEvent.press(screen.getByText("$"));
    expect(charge().valueType).toBe("fixed");
    await r.rerender(<ChargeRow charge={charge()} />);
    await fireEvent.changeText(screen.getByLabelText("Charge value"), "5");
    await fireEvent(screen.getByLabelText("Charge value"), "blur");
    expect(charge().value).toBe(500);
  });

  it("toggles kind and deletes", async () => {
    const charge = seed();
    await render(<ChargeRow charge={charge()} />);
    await fireEvent.press(screen.getByText("Discount"));
    expect(charge().kind).toBe("discount");
    await fireEvent.press(screen.getByLabelText("Delete Tax"));
    expect(useBillStore.getState().bill.charges).toHaveLength(0);
  });
});
