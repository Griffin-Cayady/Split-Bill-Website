import { describe, expect, it } from "vitest";
import { compressToEncodedURIComponent } from "lz-string";
import { buildShareUrl, decodeBillFromHash, encodeBillToHash, SHARE_URL_WARN_LENGTH } from "./link";
import type { Bill } from "../types";

function sampleBill(overrides: Partial<Bill> = {}): Bill {
  return {
    version: 1,
    title: "Dinner 🍜",
    dateISO: "2026-08-01",
    currency: { symbol: "Rp", roundingUnit: 500 },
    people: [
      { id: "A", name: "Alice", color: "#e11d48" },
      { id: "B", name: "Böb", color: "#2563eb" },
    ],
    items: [{ id: "1", name: "Nasi Goreng", price: 25000, quantity: 1, mode: "equal", equalPersonIds: ["A"] }],
    charges: [],
    ...overrides,
  };
}

describe("encodeBillToHash / decodeBillFromHash round trip", () => {
  it("round-trips a small bill exactly, including unicode names", () => {
    const bill = sampleBill();
    const hash = encodeBillToHash(bill);
    expect(hash.startsWith("#b=")).toBe(true);
    const result = decodeBillFromHash(hash);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.bill).toEqual(bill);
  });

  it("round-trips a large bill (many people/items) and reports its length", () => {
    const bill = sampleBill({
      people: Array.from({ length: 20 }, (_, i) => ({ id: `p${i}`, name: `Person ${i}`, color: "#000" })),
      items: Array.from({ length: 50 }, (_, i) => ({
        id: `i${i}`,
        name: `Item number ${i} with a reasonably long description`,
        price: 1000 * (i + 1),
        quantity: 1,
        mode: "equal" as const,
        equalPersonIds: [`p${i % 20}`],
      })),
    });
    const hash = encodeBillToHash(bill);
    const result = decodeBillFromHash(hash);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.bill.items.length).toBe(50);
    // sanity: this fixture should stay well under the warn threshold
    expect(hash.length).toBeLessThan(SHARE_URL_WARN_LENGTH);
  });
});

describe("decodeBillFromHash error handling", () => {
  it("returns no-hash for a hash without #b=", () => {
    expect(decodeBillFromHash("#somethingelse").ok).toBe(false);
    expect(decodeBillFromHash("").ok).toBe(false);
  });

  it("returns decompress-failed for garbage payload, never throws", () => {
    const result = decodeBillFromHash("#b=not-valid-lz-string-!!!___");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(["decompress-failed", "parse-failed"]).toContain(result.error);
  });

  it("returns invalid-schema for valid JSON that isn't a Bill", () => {
    const hash = `#b=${compressToEncodedURIComponent(JSON.stringify({ foo: "bar" }))}`;
    const result = decodeBillFromHash(hash);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("invalid-schema");
  });

  it("returns invalid-schema for an unknown version number", () => {
    const bill = { ...sampleBill(), version: 999 };
    const hash = `#b=${compressToEncodedURIComponent(JSON.stringify(bill))}`;
    const result = decodeBillFromHash(hash);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("invalid-schema");
  });
});

describe("buildShareUrl", () => {
  it("uses an explicit base URL when given", () => {
    const url = buildShareUrl(sampleBill(), "https://example.com/app");
    expect(url.startsWith("https://example.com/app#b=")).toBe(true);
  });
});
