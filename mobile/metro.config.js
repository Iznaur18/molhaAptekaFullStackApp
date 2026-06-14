const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "..");
const contractRoot = path.resolve(monorepoRoot, "contract");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];
config.resolver.extraNodeModules = {
  "@molha/api-contract": contractRoot,
  "@izibuy/design-tokens": path.resolve(monorepoRoot, "packages/design-tokens"),
  "@izibuy/shared-lib": path.resolve(monorepoRoot, "packages/shared-lib"),
};
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
