import { describe, expect, it } from "vitest";
import { formatMoney, parseMoneyInput, presetForSymbol } from "./currency";

describe("formatMoney", () => {
  it("formats zero-decimal currencies (e.g. IDR) without cents", () => {
    expect(formatMoney(40000, { symbol: "Rp", roundingUnit: 500 })).toBe("Rp 40.000");
  });

  it("formats two-decimal currencies with cents", () => {
    expect(formatMoney(4840, { symbol: "$", roundingUnit: 1 })).toBe("$ 48.40");
  });

  it("falls back gracefully for an unrecognized symbol", () => {
    expect(formatMoney(500, { symbol: "X", roundingUnit: 1 })).toBe("X 5.00");
  });
});

describe("parseMoneyInput", () => {
  it("parses a decimal string into smallest-unit integer", () => {
    expect(parseMoneyInput("48.40", { symbol: "$", roundingUnit: 1 })).toBe(4840);
  });

  it("parses an integer-only currency directly", () => {
    expect(parseMoneyInput("40000", { symbol: "Rp", roundingUnit: 500 })).toBe(40000);
  });

  it("returns 0 for unparsable input", () => {
    expect(parseMoneyInput("abc", { symbol: "$", roundingUnit: 1 })).toBe(0);
  });
});

describe("presetForSymbol", () => {
  it("finds a known preset", () => {
    expect(presetForSymbol("Rp").code).toBe("IDR");
  });
});
