import { render, screen } from "@testing-library/react-native";
import { StickyBottomBar } from "@/components/layout/StickyBottomBar";
import { useBillStore } from "@/store/billStore";
import { useUIStore } from "@shared/store/uiStore";

describe("StickyBottomBar", () => {
  beforeEach(() => {
    useBillStore.getState().resetBill();
    useUIStore.setState({ step: "people" });
  });

  it("disables Next while the step is blocked and shows the hint", async () => {
    await render(<StickyBottomBar />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByText(/at least 2 people/i)).toBeTruthy();
  });

  it("enables Next once two people exist", async () => {
    useBillStore.getState().addPerson("A");
    useBillStore.getState().addPerson("B");
    await render(<StickyBottomBar />);
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("renders nothing on the results step", async () => {
    useUIStore.setState({ step: "results" });
    await render(<StickyBottomBar />);
    expect(screen.queryByText("Next")).toBeNull();
  });
});
