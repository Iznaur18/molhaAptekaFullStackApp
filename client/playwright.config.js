import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

import {
  E2E_API_ORIGIN,
  E2E_API_PORT,
  E2E_CLIENT_ORIGIN,
  E2E_CLIENT_PORT,
} from "./e2e/helpers/urls.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CLIENT_URL = E2E_CLIENT_ORIGIN;
const SERVER_HEALTH_URL = `${E2E_API_ORIGIN}/health`;

const E2E_SERVER_ENV = {
  MONGO_URI: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/molhaApteka",
  JWT_SECRET:
    process.env.JWT_SECRET ?? "e2e-playwright-jwt-secret-minimum-32-characters",
  FRONTEND_URL: process.env.FRONTEND_URL ?? CLIENT_URL,
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: String(E2E_API_PORT),
  USER_DATA_CONFIRMATION_RATE_LIMIT_PER_HOUR: "30",
};

/**
 * Локально Playwright может не найти браузер своей ревизии (кеш ms-playwright
 * отстаёт от версии пакета), а качать ~150 МБ ради одного прогона незачем.
 * E2E_BROWSER_CHANNEL=chrome берёт установленный Google Chrome. В CI переменная
 * не задана — там по-прежнему встроенный Chromium из `playwright install`.
 */
const E2E_BROWSER_CHANNEL = process.env.E2E_BROWSER_CHANNEL || undefined;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: path.join(__dirname, "e2e/global-setup.js"),
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  use: {
    baseURL: CLIENT_URL,
    trace: "on-first-retry",
    channel: E2E_BROWSER_CHANNEL,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: E2E_BROWSER_CHANNEL },
      testIgnore: /catalog-virtualizer-mobile\.spec\.js/,
    },
    {
      name: "mobile-iphone",
      use: {
        ...devices["Desktop Chrome"],
        viewport: devices["iPhone 13"].viewport,
        userAgent: devices["iPhone 13"].userAgent,
        deviceScaleFactor: devices["iPhone 13"].deviceScaleFactor,
        isMobile: true,
        hasTouch: true,
        channel: E2E_BROWSER_CHANNEL,
      },
      testMatch: /catalog-virtualizer-mobile\.spec\.js/,
      grep: /mobile QA/,
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"], channel: E2E_BROWSER_CHANNEL },
      testMatch: /catalog-virtualizer-mobile\.spec\.js/,
      grep: /Android QA/,
    },
  ],
  webServer: [
    {
      command: "npm run start:e2e",
      cwd: path.join(__dirname, "../server"),
      url: SERVER_HEALTH_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: E2E_SERVER_ENV,
    },
    {
      command: "npm run dev",
      url: CLIENT_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        VITE_DEV_PORT: String(E2E_CLIENT_PORT),
        VITE_DEV_API_PORT: String(E2E_API_PORT),
      },
    },
  ],
});
