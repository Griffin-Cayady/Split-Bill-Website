import { fireEvent, render, screen } from "@testing-library/react-native";
import { ItemPriceField } from "@/features/items/ItemPriceField";
import { useBillStore } from "@/store/billStore";

function seedItem(symbol: string) {
  useBillStore.getState().resetBill();
  useBillStore.getState().setCurrency({ symbol, roundingUnit: 1 });
  const id = useBillStore.getState().addItem({ name: "Tea" });
  return () => useBillStore.getState().bill.items.find((i) => i.id === id)!;
}

describe("ItemPriceField", () => {
  it("stores cents for a 2-decimal currency", async () => {
    const item = seedItem("$");
    await render(<ItemPriceField item={item()} />);
    await fireEvent.changeText(screen.getByLabelText("Price"), "12.5");
    await fireEvent(screen.getByLabelText("Price"), "blur");
    expect(item().price).toBe(1250);
  });

  it("stores whole units for a 0-decimal currency and 0 for junk", async () => {
    const item = seedItem("Rp");
    await render(<ItemPriceField item={item()} />);
    await fireEvent.changeText(screen.getByLabelText("Price"), "40000");
    await fireEvent(screen.getByLabelText("Price"), "blur");
    expect(item().price).toBe(40000);
    await fireEvent.changeText(screen.getByLabelText("Price"), "abc");
    await fireEvent(screen.getByLabelText("Price"), "blur");
    expect(item().price).toBe(0);
  });
});
