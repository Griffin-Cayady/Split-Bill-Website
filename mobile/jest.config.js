const preset = require("jest-expo/jest-preset");

// Extend (don't replace) jest-expo's transform allowlist so NativeWind's
// ESM packages get compiled too.
const [allowlist, ...rest] = preset.transformIgnorePatterns;
const extended = allowlist.replace("standard-navigation))", "standard-navigation|nativewind|react-native-css-interop))");

module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@shared/(.*)$": "<rootDir>/../src/$1",
  },
  transformIgnorePatterns: [extended, ...rest],
};
