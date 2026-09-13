import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { billPersistOptions, billStoreInitializer, type BillStore } from "@shared/store/billStoreCore";

export { createDefaultBill } from "@shared/store/billStoreCore";

export const useBillStore = create<BillStore>()(
  persist(billStoreInitializer, { ...billPersistOptions, storage: createJSONStorage(() => AsyncStorage) }),
);
