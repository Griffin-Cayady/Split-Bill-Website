import { create } from "zustand";
import { useBillStore } from "@/store/billStore";
import type { Item } from "@shared/lib/types";

interface PendingDelete {
  item: Item;
  index: number;
}

interface UndoStore {
  pending: PendingDelete | null;
  schedule: (item: Item, index: number) => void;
  undo: () => void;
  clear: () => void;
}

const UNDO_WINDOW_MS = 5000;
let timer: ReturnType<typeof setTimeout> | null = null;

/**
 * Single pending item deletion with a 5 s undo window (mirrors the web's
 * useUndoableDelete). Kept in a store so the snackbar can render outside the
 * scrolled step content.
 */
export const useUndoStore = create<UndoStore>((set, get) => ({
  pending: null,
  schedule: (item, index) => {
    if (timer) clearTimeout(timer);
    set({ pending: { item, index } });
    timer = setTimeout(() => set({ pending: null }), UNDO_WINDOW_MS);
  },
  undo: () => {
    const current = get().pending;
    if (!current) return;
    if (timer) clearTimeout(timer);
    useBillStore.getState().addItemAt(current.item, current.index);
    set({ pending: null });
  },
  clear: () => {
    if (timer) clearTimeout(timer);
    set({ pending: null });
  },
}));
