const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier");

module.exports = defineConfig([
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".expo/**",
      ".eas-inspect/**",
      "eas-build-debug.log",
      "components/useClientOnlyValue.web.ts",
    ],
  },
  expoConfig,
  prettierConfig,
]);
