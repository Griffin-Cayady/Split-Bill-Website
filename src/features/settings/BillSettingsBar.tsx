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
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-paper-raised py-2.5 pr-2.5 pl-4 shadow-card">
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
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-field-border px-3.5 text-sm font-semibold text-ink transition-[background-color,transform] hover:bg-paper-hover active:scale-[0.97]"
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
        <div id={panelId} className="flex flex-col gap-3.5 rounded-2xl border border-border bg-paper-raised px-4 py-4 shadow-card">
          <SettingsFields />
          <div className="flex w-full items-center justify-between gap-3 border-t border-dashed border-border pt-3">
            <div>
              <ResetBillButton />
            </div>
            <button
              type="button"
              aria-expanded
              aria-controls={panelId}
              onClick={() => setExpanded(false)}
              className="min-h-11 rounded-xl bg-ink px-5 text-sm font-semibold text-paper transition-transform active:scale-[0.97]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wider screens: a masthead strip ruled like the top of a receipt, not a boxed form.
  // "Clear bill" lives in the header row above (see AppShell).
  return (
    <div className="px-4 sm:px-6">
      <div id={panelId} className="mx-auto flex max-w-6xl flex-wrap items-end gap-x-8 gap-y-4 border-y border-dashed border-field-border py-4">
        <SettingsFields />
      </div>
    </div>
  );
}

const fieldLabel = "font-mono text-label font-medium tracking-[0.08em] text-ink-soft uppercase";
const ruledField =
  "h-11 w-full border-0 border-b-[1.5px] border-field-border bg-transparent px-0.5 text-ink transition-colors hover:border-ink focus:border-accent focus:shadow-[0_1.5px_0_0_var(--accent)] focus:outline-none";

function SettingsFields() {
  const bill = useBillStore((s) => s.bill);
  const setTitle = useBillStore((s) => s.setTitle);
  const setDateISO = useBillStore((s) => s.setDateISO);
  const setCurrency = useBillStore((s) => s.setCurrency);

  const currentPreset = CURRENCY_PRESETS.find((p) => p.symbol === bill.currency.symbol);
  const currentValue = currentPreset ? currentPreset.code : "custom";

  return (
    <>
      <label className="flex min-w-[13rem] flex-[3_1_320px] flex-col gap-1">
        <span className={fieldLabel}>Bill name</span>
        <input
          value={bill.title}
          onChange={(e) => setTitle(e.target.value)}
          className={clsx(ruledField, "font-display text-xl font-semibold tracking-tight")}
        />
      </label>

      <label className="flex flex-[1_1_150px] flex-col gap-1">
        <span className={fieldLabel}>Date</span>
        <input
          type="date"
          value={bill.dateISO}
          onChange={(e) => setDateISO(e.target.value)}
          className={clsx(ruledField, "font-mono text-secondary")}
        />
      </label>

      <label className="flex flex-[0_1_140px] flex-col gap-1">
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
