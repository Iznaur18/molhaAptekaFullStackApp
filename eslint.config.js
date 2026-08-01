import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

const sharedIgnores = [
  "**/node_modules/**",
  "**/dist/**",
  "**/coverage/**",
  "**/playwright-report/**",
  "**/test-results/**",
  "**/.cursor/**",
  "**/.expo/**",
  "mobile/**",
  "package-lock.json",
];

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: sharedIgnores },
  js.configs.recommended,
  prettier,
  {
    files: ["client/**/*.{js,jsx}", "client/e2e/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "react/prop-types": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["server/**/*.{js,mjs}", "contract/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Бизнес-код и общие утилиты пишут через структурный logServerEvent
      // (JSON в stdout/stderr + Sentry-контекст), а не голым console.
      "no-console": "error",
    },
  },
  {
    // Разрешённые console: сам sink-логер, CLI-скрипты, тесты и
    // инфраструктурные entrypoints (worker/cron/queue/db bootstrap),
    // где stdout — это и есть операционный канал, а Sentry-контекста ещё нет.
    files: [
      "server/utils/logServerEvent.js",
      "server/scripts/**/*.{js,mjs}",
      "server/tests/**/*.js",
      "server/jobs/**/*.js",
      "server/queues/**/*.js",
      "server/db/**/*.js",
      "server/index.js",
      "server/worker.js",
      "server/instrument.js",
    ],
    rules: {
      "no-console": "off",
    },
  },
];
