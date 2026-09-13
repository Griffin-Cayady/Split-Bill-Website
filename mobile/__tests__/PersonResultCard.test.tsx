import { fireEvent, render, screen } from "@testing-library/react-native";
import { PersonResultCard } from "@/features/results/PersonResultCard";
import type { Person, PersonResult } from "@shared/lib/types";

const person: Person = { id: "a", name: "Ana", color: "#e11d48" };
const result: PersonResult = {
  personId: "a",
  itemLines: [{ itemId: "i1", label: "Takoyaki", share: 25000 }],
  chargeLines: [{ chargeId: "c1", label: "Tax", share: 2750 }],
  subtotal: 25000,
  total: 27750,
};
const currency = { symbol: "Rp", roundingUnit: 1 as const };

describe("PersonResultCard", () => {
  it("expands on press and toggles settled", async () => {
    const onTogglePaid = jest.fn();
    await render(<PersonResultCard person={person} result={result} currency={currency} onTogglePaid={onTogglePaid} />);
    expect(screen.queryByText("Takoyaki")).toBeNull();
    await fireEvent.press(screen.getByText("Ana"));
    expect(screen.getByText("Takoyaki")).toBeTruthy();
    expect(screen.getByText("Rp 27.750")).toBeTruthy();
    await fireEvent.press(screen.getByText("Mark as settled"));
    expect(onTogglePaid).toHaveBeenCalledWith("a");
  });

  it("shows the settled pill when paid", async () => {
    await render(<PersonResultCard person={{ ...person, paid: true }} result={result} currency={currency} />);
    expect(screen.getByText("Settled ✓")).toBeTruthy();
  });
});
