import { useEffect, useState } from "react";
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/layout/Header";
import { BillSettingsBar } from "@/components/layout/BillSettingsBar";
import { StepNav } from "@/components/layout/StepNav";
import { StickyBottomBar, BOTTOM_BAR_HEIGHT } from "@/components/layout/StickyBottomBar";
import { StepPlaceholder } from "@/components/layout/StepPlaceholder";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ToastViewport } from "@/components/ui/ToastViewport";
import { PeopleStep } from "@/features/people/PeopleStep";
import { useBillStore } from "@/store/billStore";
import { session } from "@/session";
import { STEPS, useUIStore } from "@shared/store/uiStore";

/**
 * Single-screen wizard: steps swap in place based on uiStore.step, exactly
 * like the website — no navigation stack between steps.
 */
export default function Index() {
  const step = useUIStore((s) => s.step);
  const goBack = useUIStore((s) => s.goBack);
  const bill = useBillStore((s) => s.bill);
  const resetBill = useBillStore((s) => s.resetBill);
  const insets = useSafeAreaInsets();
  // _layout.tsx gates on hydration, so this initial read sees the persisted bill.
  const [showResume, setShowResume] = useState(() => {
    const b = useBillStore.getState().bill;
    return !session.resumeAcknowledged && (b.people.length > 0 || b.items.length > 0);
  });

  // Android hardware back: previous step, or let the OS exit from the first step.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (useUIStore.getState().step === STEPS[0]) return false;
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [goBack]);

  function acknowledge() {
    session.resumeAcknowledged = true;
    setShowResume(false);
  }

  const body =
    step === "people" ? (
      <PeopleStep />
    ) : step === "items" ? (
      <StepPlaceholder name="Items" />
    ) : step === "charges" ? (
      <StepPlaceholder name="Extras" />
    ) : (
      <StepPlaceholder name="Totals" />
    );

  const bottomPad = step === "results" ? 24 : BOTTOM_BAR_HEIGHT + 40;

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-paper">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: bottomPad + insets.bottom }}>
          <Header />
          <BillSettingsBar />
          <StepNav />
          <View className="px-4 pt-2">{body}</View>
        </ScrollView>
      </KeyboardAvoidingView>
      <StickyBottomBar />
      <ToastViewport bottomOffset={step === "results" ? 0 : BOTTOM_BAR_HEIGHT} />
      <ConfirmDialog
        open={showResume}
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
    </View>
  );
}
