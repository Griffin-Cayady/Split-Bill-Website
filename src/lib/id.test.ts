import { describe, expect, it } from "vitest";
import { colorForIndex, generateId, initials, PERSON_COLORS } from "./id";

describe("generateId", () => {
  it("returns unique-looking ids", () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(0);
  });
});

describe("colorForIndex", () => {
  it("cycles through the palette", () => {
    expect(colorForIndex(0)).toBe(PERSON_COLORS[0]);
    expect(colorForIndex(PERSON_COLORS.length)).toBe(PERSON_COLORS[0]);
    expect(colorForIndex(PERSON_COLORS.length + 1)).toBe(PERSON_COLORS[1]);
  });
});

describe("initials", () => {
  it("uses first two letters of a single name", () => {
    expect(initials("Alice")).toBe("AL");
  });

  it("uses first letter of first and last name", () => {
    expect(initials("Alice Wonderland")).toBe("AW");
  });

  it("falls back to ? for empty input", () => {
    expect(initials("   ")).toBe("?");
  });
});
