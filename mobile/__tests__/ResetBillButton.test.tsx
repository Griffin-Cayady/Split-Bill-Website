import { fireEvent, render, screen } from "@testing-library/react-native";
import { ResetBillButton } from "@/components/layout/ResetBillButton";
import { useBillStore } from "@/store/billStore";
import { useUIStore } from "@shared/store/uiStore";

describe("ResetBillButton", () => {
  it("clears the bill only after confirming", async () => {
    useBillStore.getState().resetBill();
    useBillStore.getState().addPerson("Sam");
    useUIStore.setState({ step: "items", toasts: [] });
    await render(<ResetBillButton />);
    await fireEvent.press(screen.getByText("Start over"));
    expect(useBillStore.getState().bill.people).toHaveLength(1);
    await fireEvent.press(screen.getByText("OK"));
    expect(useBillStore.getState().bill.people).toHaveLength(0);
    expect(useUIStore.getState().step).toBe("people");
    expect(useUIStore.getState().toasts[0]?.message).toBe("Started a fresh bill");
  });
});
