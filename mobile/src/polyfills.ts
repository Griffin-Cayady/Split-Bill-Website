import { randomUUID } from "expo-crypto";

// Shared src/lib/id.ts and src/store/uiStore.ts call crypto.randomUUID(),
// which Hermes doesn't provide. Install it once before anything else loads.
const g = globalThis as { crypto?: { randomUUID?: () => string } };
if (!g.crypto) g.crypto = {};
if (typeof g.crypto.randomUUID !== "function") g.crypto.randomUUID = () => randomUUID();
