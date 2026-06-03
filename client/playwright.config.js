import { defineConfig, devices } from "@playwright/test";

const CLIENT_URL = "http://127.0.0.1:5173";
const SERVER_HEALTH_URL = "http://127.0.0.1:4444/health";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
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
      command: "npm run start:dev",
      cwd: "../server",
      url: SERVER_HEALTH_URL,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "npm run dev",
      url: CLIENT_URL,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
