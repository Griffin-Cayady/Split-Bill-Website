import { useBillStore } from "../../store/billStore";
import { CURRENCY_PRESETS } from "../../lib/currency";
import { ResetBillButton } from "../../components/layout/ResetBillButton";

export function BillSettingsBar() {
  const bill = useBillStore((s) => s.bill);
  const setTitle = useBillStore((s) => s.setTitle);
  const setDateISO = useBillStore((s) => s.setDateISO);
  const setCurrency = useBillStore((s) => s.setCurrency);

  const currentPreset = CURRENCY_PRESETS.find((p) => p.symbol === bill.currency.symbol);
  const currentValue = currentPreset ? currentPreset.code : "custom";

  return (
    <div className="px-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end gap-3.5 rounded-2xl border-[1.5px] border-border bg-paper-raised px-4.5 py-4">
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

        <ResetBillButton />
      </div>
    </div>
  );
}
