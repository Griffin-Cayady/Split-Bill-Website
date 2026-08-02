import type { Currency } from "./types";

// The wire schema (Bill.currency, §9) only carries {symbol, roundingUnit} so
// shared links stay small and forward-compatible. Decimal-digit / locale
// knowledge lives here, client-side only, keyed off the symbol.
export type CurrencyPreset = {
  code: string;
  symbol: string;
  decimalDigits: 0 | 2;
  defaultRoundingUnit: 1 | 100 | 500;
  locale: string;
};

export const CURRENCY_PRESETS: CurrencyPreset[] = [
  { code: "IDR", symbol: "Rp", decimalDigits: 0, defaultRoundingUnit: 1, locale: "id-ID" },
  { code: "USD", symbol: "$", decimalDigits: 2, defaultRoundingUnit: 1, locale: "en-US" },
  { code: "EUR", symbol: "€", decimalDigits: 2, defaultRoundingUnit: 1, locale: "de-DE" },
  { code: "GBP", symbol: "£", decimalDigits: 2, defaultRoundingUnit: 1, locale: "en-GB" },
  { code: "JPY", symbol: "¥", decimalDigits: 0, defaultRoundingUnit: 1, locale: "ja-JP" },
  { code: "SGD", symbol: "S$", decimalDigits: 2, defaultRoundingUnit: 1, locale: "en-SG" },
  { code: "MYR", symbol: "RM", decimalDigits: 2, defaultRoundingUnit: 1, locale: "ms-MY" },
  { code: "PHP", symbol: "₱", decimalDigits: 2, defaultRoundingUnit: 1, locale: "en-PH" },
  { code: "THB", symbol: "฿", decimalDigits: 2, defaultRoundingUnit: 1, locale: "th-TH" },
  { code: "INR", symbol: "₹", decimalDigits: 2, defaultRoundingUnit: 1, locale: "en-IN" },
  { code: "AUD", symbol: "A$", decimalDigits: 2, defaultRoundingUnit: 1, locale: "en-AU" },
  { code: "VND", symbol: "₫", decimalDigits: 0, defaultRoundingUnit: 500, locale: "vi-VN" },
];

const FALLBACK_PRESET: CurrencyPreset = {
  code: "USD",
  symbol: "$",
  decimalDigits: 2,
  defaultRoundingUnit: 1,
  locale: "en-US",
};

export function presetForSymbol(symbol: string): CurrencyPreset {
  return CURRENCY_PRESETS.find((c) => c.symbol === symbol) ?? { ...FALLBACK_PRESET, symbol };
}

export function defaultCurrency(): Currency {
  const locale = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";
  const lang = locale.split("-")[0]?.toLowerCase();
  const match = CURRENCY_PRESETS.find((c) => c.locale.split("-")[0]?.toLowerCase() === lang);
  const preset = match ?? FALLBACK_PRESET;
  return { symbol: preset.symbol, roundingUnit: preset.defaultRoundingUnit };
}

/** Formats an integer smallest-currency-unit amount for display, e.g. 4840 -> "$48.40". */
export function formatMoney(amount: number, currency: Currency): string {
  const preset = presetForSymbol(currency.symbol);
  const value = amount / 10 ** preset.decimalDigits;
  const formatted = new Intl.NumberFormat(preset.locale, {
    minimumFractionDigits: preset.decimalDigits,
    maximumFractionDigits: preset.decimalDigits,
  }).format(value);
  return `${currency.symbol} ${formatted}`;
}

/** Parses user-typed decimal text into the integer smallest-currency-unit representation. */
export function parseMoneyInput(text: string, currency: Currency): number {
  const preset = presetForSymbol(currency.symbol);
  const cleaned = text.replace(/[^0-9.,-]/g, "").replace(",", ".");
  const value = Number.parseFloat(cleaned);
  if (Number.isNaN(value)) return 0;
  return Math.round(value * 10 ** preset.decimalDigits);
}
