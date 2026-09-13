import { fireEvent, render, screen } from "@testing-library/react-native";
import { ItemDiscount } from "@/features/items/ItemDiscount";
import { useBillStore } from "@/store/billStore";

function seed() {
  useBillStore.getState().resetBill();
  useBillStore.getState().setCurrency({ symbol: "$", roundingUnit: 1 });
  const id = useBillStore.getState().addItem({ name: "Tea", price: 1000 });
  return () => useBillStore.getState().bill.items.find((i) => i.id === id)!;
}

describe("ItemDiscount", () => {
  it("adds a percent discount, edits it, switches to fixed, and removes it", async () => {
    const item = seed();
    const r = await render(<ItemDiscount item={item()} compact />);
    await fireEvent.press(screen.getByText("Discount"));
    expect(item().discount).toEqual({ valueType: "percent", value: 0 });

    await r.rerender(<ItemDiscount item={item()} />);
    await fireEvent.changeText(screen.getByLabelText("Discount value"), "10");
    await fireEvent(screen.getByLabelText("Discount value"), "blur");
    expect(item().discount?.value).toBe(10);

    await r.rerender(<ItemDiscount item={item()} />);
    await fireEvent.press(screen.getByText("$"));
    expect(item().discount?.valueType).toBe("fixed");
    await r.rerender(<ItemDiscount item={item()} />);
    await fireEvent.changeText(screen.getByLabelText("Discount value"), "5");
    await fireEvent(screen.getByLabelText("Discount value"), "blur");
    expect(item().discount?.value).toBe(500);

    await r.rerender(<ItemDiscount item={item()} />);
    await fireEvent.press(screen.getByLabelText("Remove item discount"));
    expect(item().discount).toBeUndefined();
  });
});
