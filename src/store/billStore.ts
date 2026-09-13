import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { billPersistOptions, billStoreInitializer, type BillStore } from "./billStoreCore";

export { createDefaultBill } from "./billStoreCore";

export const useBillStore = create<BillStore>()(
  persist(billStoreInitializer, { ...billPersistOptions, storage: createJSONStorage(() => localStorage) }),
);
