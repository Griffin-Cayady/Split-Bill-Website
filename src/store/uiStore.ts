import { create } from "zustand";

export type Step = "people" | "items" | "charges" | "results";
export const STEPS: Step[] = ["people", "items", "charges", "results"];

export type Toast = { id: string; message: string };

interface UIStore {
  step: Step;
  setStep: (step: Step) => void;
  goNext: () => void;
  goBack: () => void;

  toasts: Toast[];
  pushToast: (message: string) => void;
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
  pushToast: (message) => set((s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), message }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
