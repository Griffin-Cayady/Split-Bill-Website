import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { Bill } from "../types";

export const SHARE_URL_WARN_LENGTH = 8000;

export type DecodeResult =
  | { ok: true; bill: Bill }
  | { ok: false; error: "no-hash" | "decompress-failed" | "parse-failed" | "invalid-schema" };

const KNOWN_VERSIONS = new Set([1]);

function isValidBillShape(value: unknown): value is Bill {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.version !== "number" || !KNOWN_VERSIONS.has(v.version)) return false;
  if (typeof v.title !== "string") return false;
  if (typeof v.dateISO !== "string") return false;
  if (typeof v.currency !== "object" || v.currency === null) return false;
  const currency = v.currency as Record<string, unknown>;
  if (typeof currency.symbol !== "string") return false;
  if (currency.roundingUnit !== 1 && currency.roundingUnit !== 100 && currency.roundingUnit !== 500) return false;
  if (!Array.isArray(v.people)) return false;
  if (!Array.isArray(v.items)) return false;
  if (!Array.isArray(v.charges)) return false;
  return true;
}

export function encodeBillToHash(bill: Bill): string {
  const json = JSON.stringify(bill);
  const compressed = compressToEncodedURIComponent(json);
  return `#b=${compressed}`;
}

export function buildShareUrl(bill: Bill): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${window.location.pathname}${encodeBillToHash(bill)}`;
}

export function decodeBillFromHash(hash: string): DecodeResult {
  const match = /^#b=(.+)$/.exec(hash);
  if (!match) return { ok: false, error: "no-hash" };

  let json: string | null;
  try {
    json = decompressFromEncodedURIComponent(match[1]);
  } catch {
    json = null;
  }
  if (!json) return { ok: false, error: "decompress-failed" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "parse-failed" };
  }

  if (!isValidBillShape(parsed)) return { ok: false, error: "invalid-schema" };
  return { ok: true, bill: parsed };
}
