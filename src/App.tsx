import { useEffect, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ConfirmDialog } from "./components/ui/ConfirmDialog";
import { ToastViewport } from "./components/ui/ToastViewport";
import { useBillStore } from "./store/billStore";
import { useTheme } from "./hooks/useTheme";
import { useHashRoute } from "./hooks/useHashRoute";
import { ReadOnlyResults } from "./features/results/ReadOnlyResults";
import { InvalidLinkNotice } from "./features/results/InvalidLinkNotice";

const RESUME_ACK_KEY = "spliteasy.resume.ack";

function App() {
  useTheme();
  const hashRoute = useHashRoute();
  const bill = useBillStore((s) => s.bill);
  const resetBill = useBillStore((s) => s.resetBill);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  useEffect(() => {
    const hasSharedLinkHash = window.location.hash.startsWith("#b=");
    const alreadyAsked = sessionStorage.getItem(RESUME_ACK_KEY) === "1";

    function maybePrompt() {
      const currentBill = useBillStore.getState().bill;
      const hasContent = currentBill.people.length > 0 || currentBill.items.length > 0;
      if (!hasSharedLinkHash && !alreadyAsked && hasContent) {
        setShowResumePrompt(true);
      }
    }

    if (useBillStore.persist.hasHydrated()) {
      maybePrompt();
      return;
    }
    return useBillStore.persist.onFinishHydration(maybePrompt);
  }, []);

  function acknowledge() {
    sessionStorage.setItem(RESUME_ACK_KEY, "1");
    setShowResumePrompt(false);
  }

  if (hashRoute) {
    return (
      <ErrorBoundary>
        {hashRoute.ok ? <ReadOnlyResults bill={hashRoute.bill} /> : <InvalidLinkNotice />}
        <ToastViewport />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AppShell />
      <ConfirmDialog
        open={showResumePrompt}
        title="Resume your previous bill?"
        description={`"${bill.title}" was saved from last time. Continue with it, or start a new bill?`}
        confirmLabel="Resume"
        cancelLabel="Start new"
        onConfirm={acknowledge}
        onCancel={() => {
          resetBill();
          acknowledge();
        }}
      />
    </ErrorBoundary>
  );
}

export default App;
