import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "./helpers/test.js";

import { loginAndGetCookieHeader, loginViaApiCookies } from "./helpers/api.js";
import {
  E2E_FIXTURE,
  E2E_MODERATOR,
  E2E_SAMPLE_IMAGE_PATH,
  E2E_SELLER,
} from "./helpers/fixtures.js";

const SERVER_URL = "http://127.0.0.1:4444";
const SCROLL_PAUSE_MS = 500;
const LOAD_MORE_ATTEMPTS = 25;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_IMAGE_PATH = E2E_SAMPLE_IMAGE_PATH ?? path.join(__dirname, "fixtures/sample-upload.png");

/**
 * @param {import('@playwright/test').APIRequestContext} request
 */
async function fetchManageToggleDisplays(request) {
  const response = await request.get(`${SERVER_URL}/product/manage-toggle-displays`);
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.success).toBe(true);
  return body.data?.displays ?? [];
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} cookieHeader
 * @param {string} toggleKey
 * @param {string} imageUrl
 */
async function patchManageToggleDisplayViaApi(request, cookieHeader, toggleKey, imageUrl) {
  const response = await request.patch(
    `${SERVER_URL}/product/manage-toggle-displays/${encodeURIComponent(toggleKey)}`,
    {
      headers: { Cookie: cookieHeader },
      data: { imageUrl },
    },
  );
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.success).toBe(true);
  return body.data?.display;
}

async function waitForServerReady(request) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await request.get(`${SERVER_URL}/health`);
      if (response.ok()) {
        return;
      }
    } catch {
      // API ещё поднимается вместе с webServer Playwright.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("API /health не ответил");
}

test.describe.serial("product manage toggle display", () => {
  test.beforeAll(async ({ request }) => {
    await waitForServerReady(request);
  });

  test("moderator: admin page uploads auction toggle artwork", async ({ page, request }) => {
    await loginViaApiCookies(page, request, E2E_MODERATOR);
    await page.goto("/product-manage-toggle-display-admin");

    await expect(
      page.getByRole("heading", { name: "Кнопки управления товаром" }),
    ).toBeVisible({ timeout: 15_000 });

    const auctionCard = page.locator(".product-manage-toggle-admin-card").nth(0);
    await expect(auctionCard).toBeVisible();

    const uploadResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/upload") &&
        response.request().method() === "POST" &&
        response.status() === 200,
    );

    await auctionCard
      .getByLabel("Выбрать изображение с устройства")
      .setInputFiles(SAMPLE_IMAGE_PATH);

    const uploadResponse = await uploadResponsePromise;
    const uploadBody = await uploadResponse.json();
    const uploadedUrl = String(uploadBody?.data?.url ?? "");
    expect(uploadedUrl).toMatch(/\/uploads\/.+/);

    const patchResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/product/manage-toggle-displays/auction") &&
        response.request().method() === "PATCH" &&
        response.status() === 200,
    );

    await auctionCard.getByRole("button", { name: "Сохранить", exact: true }).click();
    await patchResponsePromise;

    const displays = await fetchManageToggleDisplays(request);
    const auctionDisplay = displays.find((row) => row.toggleKey === "auction");
    expect(auctionDisplay?.imageUrl).toMatch(/\/uploads\/.+/);

    await expect(
      auctionCard.locator(".product-manage-toggle-row__artwork img"),
    ).toHaveAttribute("src", /\/uploads\/.+/);
  });

  test("seller: product manage row shows auction artwork from API", async ({ page, request }) => {
    const moderatorCookie = await loginAndGetCookieHeader(request, E2E_MODERATOR);
    const imageUrl = "/uploads/e2e-auction-toggle-artwork.png";

    await patchManageToggleDisplayViaApi(request, moderatorCookie, "auction", imageUrl);

    await loginViaApiCookies(page, request, E2E_SELLER);
    await page.goto("/my-products");
    await expect(page.getByText(/Товаров: \d+/)).toBeVisible({ timeout: 15_000 });

    const productCard = page.locator(".product-card").filter({
      has: page.getByText(E2E_FIXTURE.catalogProductName, { exact: true }),
    });

    for (let attempt = 0; attempt < LOAD_MORE_ATTEMPTS; attempt += 1) {
      if ((await productCard.count()) > 0) {
        break;
      }
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
      await page.waitForTimeout(SCROLL_PAUSE_MS);
    }

    await expect(productCard.first()).toBeVisible({ timeout: 5_000 });
    await productCard.first().scrollIntoViewIfNeeded();
    await productCard.first().getByRole("button", { name: "Управление", exact: true }).click();

    const dialog = page.getByRole("dialog", { name: "Продвижение товара" });
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await dialog.getByRole("tab", { name: "Управление товаром", exact: true }).click();

    const auctionRow = dialog
      .locator(".product-manage-toggle-row")
      .filter({ hasText: "Аукцион" })
      .first();
    await expect(auctionRow).toBeVisible();
    await expect(auctionRow.locator(".product-manage-toggle-row__artwork img")).toHaveAttribute(
      "src",
      /\/uploads\/.+/,
    );
  });
});
