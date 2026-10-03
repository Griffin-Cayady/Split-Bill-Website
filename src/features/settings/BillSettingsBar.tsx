import { useId, useState } from "react";
import { useBillStore } from "../../store/billStore";
import { CURRENCY_PRESETS } from "../../lib/currency";
import { ResetBillButton } from "../../components/layout/ResetBillButton";
import { PencilIcon } from "../../components/ui/icons";
import { useMediaQuery, isMobileQuery } from "../../hooks/useMediaQuery";

function formatBillDate(dateISO: string): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  if (!y || !m || !d) return dateISO;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Bill name, date, currency and "Clear bill". These are set once per bill, so
 * on phones they collapse to a one-line summary instead of pushing every
 * step's content below the fold.
 */
export function BillSettingsBar() {
  const bill = useBillStore((s) => s.bill);
  const isMobile = useMediaQuery(isMobileQuery);
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  const currentPreset = CURRENCY_PRESETS.find((p) => p.symbol === bill.currency.symbol);

  if (isMobile && !expanded) {
    return (
      <div className="px-4">
        <div className="flex items-center gap-3 rounded-2xl border-[1.5px] border-border bg-paper-raised py-2.5 pr-2.5 pl-4">
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-lg font-bold text-ink">{bill.title.trim() || "Untitled bill"}</div>
            <div className="truncate font-mono text-[13px] text-ink-soft">
              {formatBillDate(bill.dateISO)} · {currentPreset?.code ?? bill.currency.symbol}
            </div>
          </div>
          <button
            type="button"
            aria-expanded={false}
            aria-controls={panelId}
            onClick={() => setExpanded(true)}
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border-[1.5px] border-border px-3.5 text-sm font-bold text-ink hover:bg-paper-hover"
          >
            <PencilIcon width={15} height={15} aria-hidden="true" />
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6">
      <div
        id={panelId}
        className="mx-auto flex max-w-6xl flex-wrap items-end gap-3.5 rounded-2xl border-[1.5px] border-border bg-paper-raised px-4.5 py-4"
      >
        <SettingsFields />
        {isMobile ? (
          <div className="flex w-full items-center justify-between gap-3 border-t-[1.5px] border-dashed border-border pt-3">
            <div>
              <ResetBillButton />
            </div>
            <button
              type="button"
              aria-expanded
              aria-controls={panelId}
              onClick={() => setExpanded(false)}
              className="min-h-11 rounded-xl bg-ink px-5 text-sm font-bold text-paper"
            >
              Done
            </button>
          </div>
        ) : (
          <ResetBillButton />
        )}
      </div>
    </div>
  );
}

function SettingsFields() {
  const bill = useBillStore((s) => s.bill);
  const setTitle = useBillStore((s) => s.setTitle);
  const setDateISO = useBillStore((s) => s.setDateISO);
  const setCurrency = useBillStore((s) => s.setCurrency);

  const currentPreset = CURRENCY_PRESETS.find((p) => p.symbol === bill.currency.symbol);
  const currentValue = currentPreset ? currentPreset.code : "custom";

  return (
    <>
      <label className="flex min-w-[13rem] flex-[2_1_260px] flex-col gap-1.5">
        <span className="text-xs font-bold tracking-wide text-ink-soft uppercase">Bill name</span>
        <input
          value={bill.title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-12 rounded-xl border-[1.5px] border-border bg-paper px-3.5 font-display text-lg font-semibold text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
        />
      </label>

      <label className="flex flex-[1_1_150px] flex-col gap-1.5">
        <span className="text-xs font-bold tracking-wide text-ink-soft uppercase">Date</span>
        <input
          type="date"
          value={bill.dateISO}
          onChange={(e) => setDateISO(e.target.value)}
          className="h-12 rounded-xl border-[1.5px] border-border bg-paper px-3.5 font-mono text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
        />
      </label>

      <label className="flex flex-[0_1_140px] flex-col gap-1.5">
        <span className="text-xs font-bold tracking-wide text-ink-soft uppercase">Currency</span>
        <select
          value={currentValue}
          onChange={(e) => {
            const preset = CURRENCY_PRESETS.find((p) => p.code === e.target.value);
            if (preset) setCurrency({ symbol: preset.symbol, roundingUnit: preset.defaultRoundingUnit });
          }}
          className="h-12 cursor-pointer rounded-xl border-[1.5px] border-border bg-paper px-3.5 text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
        >
          {CURRENCY_PRESETS.map((p) => (
            <option key={p.code} value={p.code}>
              {p.symbol} {p.code}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
