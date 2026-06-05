import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CLIENT_URL = "http://127.0.0.1:5173";
const SERVER_HEALTH_URL = "http://127.0.0.1:4444/health";

const E2E_SERVER_ENV = {
  MONGO_URI: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/molhaApteka",
  JWT_SECRET:
    process.env.JWT_SECRET ?? "e2e-playwright-jwt-secret-minimum-32-characters",
  FRONTEND_URL: process.env.FRONTEND_URL ?? CLIENT_URL,
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: "4444",
};

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
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
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
    },
  ],
});
