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
    // Shared files under ../src would otherwise resolve these from the
    // website's node_modules (a second React instance → hooks crash).
    "^react$": "<rootDir>/node_modules/react",
    "^react/(.*)$": "<rootDir>/node_modules/react/$1",
    "^zustand$": "<rootDir>/node_modules/zustand",
    "^zustand/(.*)$": "<rootDir>/node_modules/zustand/$1",
    "^lz-string$": "<rootDir>/node_modules/lz-string",
  },
  transformIgnorePatterns: [extended, ...rest],
};
