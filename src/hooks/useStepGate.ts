import { STEPS, useUIStore, type Step } from "../store/uiStore";
import { validateBill } from "../lib/calc";
import type { Bill, BillValidationIssue } from "../lib/types";

function issuesForStep(step: Step, issues: BillValidationIssue[]): BillValidationIssue[] {
  if (step === "people") return issues.filter((i) => !i.itemId);
  if (step === "items") return issues.filter((i) => Boolean(i.itemId));
  return [];
}

function stepHasBlockingIssues(step: Step, issues: BillValidationIssue[]): boolean {
  return issuesForStep(step, issues).some((i) => i.level === "error");
}

/** Step-navigation gating: blocking state for "Next" and a human hint for what's missing. Platform-neutral — caller supplies the bill. */
export function useStepGate(bill: Bill) {
  const step = useUIStore((s) => s.step);
  const goNext = useUIStore((s) => s.goNext);
  const goBack = useUIStore((s) => s.goBack);

  const isFirst = step === STEPS[0];
  const isLast = step === STEPS[STEPS.length - 1];

  const validation = validateBill(bill);
  const relevantBlock = stepHasBlockingIssues(step, validation.issues);

  const currentIssues = issuesForStep(step, validation.issues);
  const hint = currentIssues.length > 0 ? currentIssues[0].message : "";

  return { isFirst, isLast, relevantBlock, goNext, goBack, hint };
}
