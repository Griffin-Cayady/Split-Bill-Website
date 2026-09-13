const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const sharedSrc = path.resolve(projectRoot, "..", "src");

const config = getDefaultConfig(projectRoot);

// Shared bill logic lives in ../src (the website). Watch only that folder —
// not the repo root — so the website's node_modules is invisible to Metro and
// every package (react, zustand, lz-string) resolves from mobile/node_modules.
// That keeps React single-instance without disabling hierarchical lookup.
config.watchFolders = [sharedSrc];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];

module.exports = withNativeWind(config, { input: "./global.css" });
