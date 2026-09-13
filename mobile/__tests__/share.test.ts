import { appBaseUrl, shareUrlFor } from "@/lib/share";
import { createDefaultBill } from "@/store/billStore";

describe("share links", () => {
  const original = process.env.EXPO_PUBLIC_APP_URL;
  afterEach(() => {
    process.env.EXPO_PUBLIC_APP_URL = original;
  });

  it("returns null when no public URL is configured", () => {
    delete process.env.EXPO_PUBLIC_APP_URL;
    expect(appBaseUrl()).toBeNull();
    expect(shareUrlFor(createDefaultBill())).toBeNull();
  });

  it("builds a link on the configured base without a trailing slash", () => {
    process.env.EXPO_PUBLIC_APP_URL = "https://x.test/app/";
    expect(appBaseUrl()).toBe("https://x.test/app");
    expect(shareUrlFor(createDefaultBill())!.startsWith("https://x.test/app#b=")).toBe(true);
  });
});
