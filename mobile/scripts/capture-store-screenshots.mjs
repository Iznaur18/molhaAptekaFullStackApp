import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, devices } from "playwright";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const MOBILE_ROOT = path.resolve(SCRIPT_DIR, "..");
const OUT_ROOT = path.resolve(MOBILE_ROOT, "store-assets");

const WEB_APP_URL = (process.env.STORE_SCREENSHOT_WEB_URL ?? "http://localhost:8081").replace(
  /\/$/,
  "",
);
const API_URL = (process.env.STORE_SCREENSHOT_API_URL ?? "http://127.0.0.1:4444").replace(
  /\/$/,
  "",
);
const PAGE_LOAD_TIMEOUT_MS = 60_000;
const SCREEN_SETTLE_MS = 1_500;

const OUTPUT_PROFILES = [
  {
    folder: "phone-6.7-apple",
    label: "iPhone 6.7 (App Store)",
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: devices["iPhone 14 Pro Max"].userAgent,
  },
  {
    folder: "phone-9x16-google",
    label: "9:16 (Google Play)",
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
];

const GUEST_SCREENS = [
  { file: "01-catalog", path: "/", waitForText: "Каталог" },
  { file: "02-product", path: null, waitForText: "Войти, чтобы добавить" },
  { file: "03-cart-guest", path: "/cart", waitForText: "Войдите" },
  { file: "04-login", path: "/login", waitForText: "Войти" },
  { file: "05-register", path: "/register", waitForText: "Зарегистрироваться" },
  { file: "06-profile-guest", path: "/profile", waitForText: "Профиль" },
  { file: "07-privacy", path: "/legal/privacy", waitForText: "Политика конфиденциальности" },
];

const fetchFirstProductPath = async () => {
  const response = await fetch(`${API_URL}/product?limit=1`);
  if (!response.ok) {
    throw new Error(`API /product failed: ${response.status}`);
  }
  const payload = await response.json();
  const productId = payload?.data?.products?.[0]?._id;
  if (!productId) {
    throw new Error("No products in catalog for product screenshot");
  }
  return `/product/${productId}`;
};

const ensureOutputDirs = async () => {
  for (const profile of OUTPUT_PROFILES) {
    await fs.mkdir(path.join(OUT_ROOT, profile.folder), { recursive: true });
  }
};

const waitForAppReady = async (page) => {
  await page.goto(`${WEB_APP_URL}/?platform=web`, {
    waitUntil: "networkidle",
    timeout: PAGE_LOAD_TIMEOUT_MS,
  });
  await page.waitForTimeout(SCREEN_SETTLE_MS);
};

const captureScreen = async (page, screen, outputDir) => {
  const routePath = screen.path ?? (await fetchFirstProductPath());
  await page.goto(`${WEB_APP_URL}${routePath}?platform=web`, {
    waitUntil: "networkidle",
    timeout: PAGE_LOAD_TIMEOUT_MS,
  });
  await page.getByText(screen.waitForText, { exact: false }).first().waitFor({
    timeout: PAGE_LOAD_TIMEOUT_MS,
  });
  await page.waitForTimeout(SCREEN_SETTLE_MS);
  await page.screenshot({
    path: path.join(outputDir, `${screen.file}.png`),
    fullPage: false,
  });
};

const captureProfile = async (browser, profile) => {
  const context = await browser.newContext(profile.device ?? profile);
  const page = await context.newPage();
  const outputDir = path.join(OUT_ROOT, profile.folder);

  console.log(`\n→ ${profile.label} → ${outputDir}`);

  try {
    await waitForAppReady(page);
    for (const screen of GUEST_SCREENS) {
      await captureScreen(page, screen, outputDir);
      console.log(`  ✓ ${screen.file}.png`);
    }
  } finally {
    await context.close();
  }
};

try {
  await ensureOutputDirs();

  const health = await fetch(`${API_URL}/health`);
  if (!health.ok) {
    throw new Error(`API not reachable at ${API_URL}. Start server first.`);
  }

  const browser = await chromium.launch({ headless: true });

  try {
    for (const profile of OUTPUT_PROFILES) {
      await captureProfile(browser, profile);
    }
  } finally {
    await browser.close();
  }

  console.log("\nDone. Auth screens (cart with items, checkout, orders) — вручную, см. mobile/docs/STORE-SCREENSHOTS.md");
} catch (error) {
  console.error(error);
  process.exit(1);
}
