import { fireEvent, render, screen } from "@testing-library/react-native";
import { ItemsStep } from "@/features/items/ItemsStep";
import { useUndoStore } from "@/features/items/undoStore";
import { useBillStore } from "@/store/billStore";

describe("ItemsStep", () => {
  beforeEach(() => {
    useBillStore.getState().resetBill();
    useUndoStore.getState().clear();
  });

  it("adds an item and shows the subtotal", async () => {
    await render(<ItemsStep />);
    expect(screen.getByText(/No items yet/)).toBeTruthy();
    await fireEvent.press(screen.getByText("Add another item"));
    expect(useBillStore.getState().bill.items).toHaveLength(1);
    expect(screen.getByText("Subtotal")).toBeTruthy();
  });

  it("deleting schedules an undo", async () => {
    useBillStore.getState().addItem({ name: "Tea" });
    await render(<ItemsStep />);
    await fireEvent.press(screen.getByLabelText("Delete Tea"));
    expect(useBillStore.getState().bill.items).toHaveLength(0);
    expect(useUndoStore.getState().pending?.item.name).toBe("Tea");
  });
});
