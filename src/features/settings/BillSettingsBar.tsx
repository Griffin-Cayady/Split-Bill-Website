import clsx from "clsx";
import { useId, useState } from "react";
import { useBillStore } from "../../store/billStore";
import { CURRENCY_PRESETS } from "../../lib/currency";
import { ResetBillButton } from "../../components/layout/ResetBillButton";
import { PencilIcon } from "../../components/ui/icons";
import { useMediaQuery, isMobileQuery } from "../../hooks/useMediaQuery";
import { formatBillDate } from "../../lib/date";

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
        <div className="flex items-center gap-3 rounded-xl border border-border bg-paper-raised py-2.5 pr-2.5 pl-4 shadow-card">
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-lg font-bold text-ink">{bill.title.trim() || "Untitled bill"}</div>
            <div className="truncate font-mono text-label text-ink-soft">
              {formatBillDate(bill.dateISO)} · {currentPreset?.code ?? bill.currency.symbol}
            </div>
          </div>
          <button
            type="button"
            aria-expanded={false}
            aria-controls={panelId}
            onClick={() => setExpanded(true)}
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-field-border px-3.5 text-sm font-semibold text-ink transition-[background-color,transform] hover:bg-paper-hover active:scale-[0.97]"
          >
            <PencilIcon width={15} height={15} aria-hidden="true" />
            Edit
          </button>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="px-4">
        <div id={panelId} className="flex flex-col gap-3.5 rounded-xl border border-border bg-paper-raised px-4 py-4 shadow-card">
          <SettingsFields />
          <div className="flex w-full items-center justify-between gap-3 border-t border-border pt-3">
            <div>
              <ResetBillButton />
            </div>
            <button
              type="button"
              aria-expanded
              aria-controls={panelId}
              onClick={() => setExpanded(false)}
              className="min-h-11 rounded-lg bg-ink px-5 text-sm font-semibold text-paper transition-transform active:scale-[0.97]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wider screens: one compact row of fields under the wordmark.
  // "Clear bill" lives in the header row above (see AppShell).
  return (
    <div className="px-4 pb-3 sm:px-6">
      <div id={panelId} className="mx-auto grid max-w-6xl grid-cols-[minmax(0,2fr)_minmax(0,1fr)_10rem] items-end gap-3">
        <SettingsFields />
      </div>
    </div>
  );
}

const fieldLabel = "text-label font-medium text-ink-soft";
const ruledField =
  "h-11 w-full rounded-lg border border-field-border bg-paper-raised px-3 text-ink transition-colors hover:border-ink focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none";

function SettingsFields() {
  const bill = useBillStore((s) => s.bill);
  const setTitle = useBillStore((s) => s.setTitle);
  const setDateISO = useBillStore((s) => s.setDateISO);
  const setCurrency = useBillStore((s) => s.setCurrency);

  const currentPreset = CURRENCY_PRESETS.find((p) => p.symbol === bill.currency.symbol);
  const currentValue = currentPreset ? currentPreset.code : "custom";

  return (
    <>
      <label className="flex min-w-0 flex-col gap-1.5">
        <span className={fieldLabel}>Bill name</span>
        <input
          value={bill.title}
          onChange={(e) => setTitle(e.target.value)}
          className={clsx(ruledField, "text-base font-semibold")}
        />
      </label>

      <label className="flex min-w-0 flex-col gap-1.5">
        <span className={fieldLabel}>Date</span>
        <input
          type="date"
          value={bill.dateISO}
          onChange={(e) => setDateISO(e.target.value)}
          className={clsx(ruledField, "font-mono text-secondary")}
        />
      </label>

      <label className="flex min-w-0 flex-col gap-1.5">
        <span className={fieldLabel}>Currency</span>
        <select
          value={currentValue}
          onChange={(e) => {
            const preset = CURRENCY_PRESETS.find((p) => p.code === e.target.value);
            if (preset) setCurrency({ symbol: preset.symbol, roundingUnit: preset.defaultRoundingUnit });
          }}
          className={clsx(ruledField, "cursor-pointer font-mono text-secondary")}
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
