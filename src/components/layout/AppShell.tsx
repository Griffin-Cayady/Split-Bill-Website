import { useMediaQuery, isDesktopQuery } from "../../hooks/useMediaQuery";
import { useUIStore } from "../../store/uiStore";
import { StepNav } from "./StepNav";
import { StickyBottomBar } from "./StickyBottomBar";
import { StepFooterNav } from "./StepFooterNav";
import { LiveSummaryPanel } from "./LiveSummaryPanel";
import { BillSettingsBar } from "../../features/settings/BillSettingsBar";
import { PeopleStep } from "../../features/people/PeopleStep";
import { ItemsStep } from "../../features/items/ItemsStep";
import { ChargesStep } from "../../features/charges/ChargesStep";
import { ResultsStep } from "../../features/results/ResultsStep";
import { ToastViewport } from "../ui/ToastViewport";

const STEP_COMPONENTS = {
  people: PeopleStep,
  items: ItemsStep,
  charges: ChargesStep,
  results: ResultsStep,
};

export function AppShell() {
  const step = useUIStore((s) => s.step);
  const isDesktop = useMediaQuery(isDesktopQuery);
  const StepComponent = STEP_COMPONENTS[step];
  const showSplitPanel = isDesktop && step !== "results";

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col">
      <header className="flex flex-wrap items-center gap-3.5 px-4 py-5 sm:px-6">
        <div className="flex items-baseline gap-2.5">
          <span className="font-display text-[26px] font-extrabold tracking-tight text-ink">
            Split<span className="text-accent">Easy</span>
          </span>
          <span className="hidden font-mono text-[12px] font-bold tracking-[0.12em] text-ink-soft uppercase sm:inline">
            split it fair
          </span>
        </div>
      </header>

      <BillSettingsBar />
      <StepNav />

      <main className="flex-1 px-4 pt-2 pb-28 sm:px-6 lg:pb-10">
        {showSplitPanel ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            <div key={step} className="animate-step-in min-w-0">
              <StepComponent />
              {isDesktop && <StepFooterNav />}
            </div>
            <div className="hidden lg:block">
              <LiveSummaryPanel />
            </div>
          </div>
        ) : (
          <div key={step} className="animate-step-in">
            <StepComponent />
            {isDesktop && <StepFooterNav />}
          </div>
        )}
      </main>

      {!isDesktop && <StickyBottomBar />}
      <ToastViewport />
    </div>
  );
}
