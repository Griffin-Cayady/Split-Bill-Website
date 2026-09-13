import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

// Hermes/Jest lack crypto.randomUUID; mirror the runtime polyfill in src/polyfills.ts.
const g = globalThis as { crypto?: { randomUUID?: () => string } };
if (!g.crypto) g.crypto = {};
if (typeof g.crypto.randomUUID !== "function") {
  g.crypto.randomUUID = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Components read insets directly; provide zero insets without a provider tree.
jest.mock("react-native-safe-area-context", () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: { children: unknown }) => children,
    SafeAreaView: ({ children }: { children: unknown }) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Native sharing modules are exercised on-device; keep Jest hermetic.
jest.mock("react-native-view-shot", () => ({ captureRef: jest.fn(async () => "file:///tmp/receipt.png") }));
jest.mock("expo-sharing", () => ({ isAvailableAsync: jest.fn(async () => true), shareAsync: jest.fn(async () => {}) }));
jest.mock("expo-media-library", () => ({
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  saveToLibraryAsync: jest.fn(async () => {}),
}));
jest.mock("expo-clipboard", () => ({ setStringAsync: jest.fn(async () => true) }));
