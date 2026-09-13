import { initials, colorForIndex } from "@shared/lib/id";
import { validateBill } from "@shared/lib/calc";
import { STEPS } from "@shared/store/uiStore";

describe("shared logic resolves through @shared alias", () => {
  it("resolves lib/id", () => {
    expect(initials("Sam Lee")).toBe("SL");
    expect(colorForIndex(0)).toBe("#e11d48");
  });
  it("resolves lib/calc and store/uiStore", () => {
    expect(STEPS).toEqual(["people", "items", "charges", "results"]);
    expect(
      validateBill({ version: 1, title: "", dateISO: "", currency: { symbol: "$", roundingUnit: 1 }, people: [], items: [], charges: [] }).valid,
    ).toBe(false);
  });
});
