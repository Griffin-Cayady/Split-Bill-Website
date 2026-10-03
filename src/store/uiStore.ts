import { create } from "zustand";

export type Step = "people" | "items" | "charges" | "results";
export const STEPS: Step[] = ["people", "items", "charges", "results"];

export type ToastAction = { label: string; onAction: () => void };
export type Toast = { id: string; message: string; action?: ToastAction };

interface UIStore {
  step: Step;
  setStep: (step: Step) => void;
  goNext: () => void;
  goBack: () => void;

  toasts: Toast[];
  /** Returns the toast id, so callers can dismiss it early. */
  pushToast: (message: string, action?: ToastAction) => string;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  step: "people",
  setStep: (step) => set({ step }),
  goNext: () => {
    const idx = STEPS.indexOf(get().step);
    if (idx < STEPS.length - 1) set({ step: STEPS[idx + 1] });
  },
  goBack: () => {
    const idx = STEPS.indexOf(get().step);
    if (idx > 0) set({ step: STEPS[idx - 1] });
  },

  toasts: [],
  pushToast: (message, action) => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, action }] }));
    return id;
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
