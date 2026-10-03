import { useEffect, useRef } from "react";
import { useMediaQuery, isDesktopQuery, isMobileQuery } from "../../hooks/useMediaQuery";
import { ResetBillButton } from "./ResetBillButton";
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
  const isMobile = useMediaQuery(isMobileQuery);
  const StepComponent = STEP_COMPONENTS[step];
  const showSplitPanel = isDesktop && step !== "results";
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  // On step change, start the new step from the top and move focus to its
  // heading, so keyboard and screen-reader users land where sighted users look.
  // Skipped on first render so page load never steals focus.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    const heading = mainRef.current?.querySelector<HTMLHeadingElement>("h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [step]);

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col">
      <header className="flex min-h-16 items-center gap-3.5 px-4 pt-3 sm:px-6">
        <span className="font-display text-xl font-bold tracking-[-0.04em] text-ink">
          Split<span className="text-accent">Easy</span>
        </span>
        {/* On phones "Clear bill" sits inside the expanded bill settings instead. */}
        {!isMobile && <ResetBillButton />}
      </header>

      <BillSettingsBar />
      <StepNav />

      <main ref={mainRef} className="flex-1 px-4 pt-6 pb-[calc(var(--bottom-bar-h,0px)+24px)] sm:px-6 lg:pb-10">
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
