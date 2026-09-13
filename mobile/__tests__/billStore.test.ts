import AsyncStorage from "@react-native-async-storage/async-storage";
import { useBillStore } from "@/store/billStore";

const KEY = "spliteasy.bill.v1";

describe("mobile billStore", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useBillStore.getState().resetBill();
  });

  it("persists people to AsyncStorage and rehydrates them", async () => {
    useBillStore.getState().addPerson("Sam");
    await new Promise((r) => setTimeout(r, 0)); // let persist flush
    const raw = await AsyncStorage.getItem(KEY);
    expect(raw).toContain("Sam");

    // Simulate a fresh process: in-memory state empty, storage still holds the snapshot.
    useBillStore.getState().resetBill();
    await new Promise((r) => setTimeout(r, 0));
    await AsyncStorage.setItem(KEY, raw!);
    await useBillStore.persist.rehydrate();
    expect(useBillStore.getState().bill.people.map((p) => p.name)).toEqual(["Sam"]);
  });
});
