import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

// Hermes/Jest lack crypto.randomUUID; mirror the runtime polyfill in src/polyfills.ts.
const g = globalThis as { crypto?: { randomUUID?: () => string } };
if (!g.crypto) g.crypto = {};
if (typeof g.crypto.randomUUID !== "function") {
  g.crypto.randomUUID = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
}
