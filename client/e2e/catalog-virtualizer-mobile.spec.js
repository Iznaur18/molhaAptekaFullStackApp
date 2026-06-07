import { expect, test } from "@playwright/test";

import { E2E_FIXTURE } from "./helpers/fixtures.js";

const SCROLL_PAUSE_MS = 500;
const LOAD_MORE_ATTEMPTS = 25;
const SEARCH_DEBOUNCE_MS = 1200;

/**
 * @param {import('@playwright/test').Page} page
 */
async function countCatalogCards(page) {
  return page
    .getByRole("list", { name: /товар/i })
    .locator("article.product-card")
    .count();
}

/**
 * Изолируем e2e-товары без tier-3 баннеров (они отключают virtualizer).
 *
 * @param {import('@playwright/test').Page} page
 */
async function waitForVirtualCatalog(page) {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Поиск товаров" }).fill(E2E_FIXTURE.virtualCatalogPrefix);
  await page.waitForTimeout(SEARCH_DEBOUNCE_MS);

  await expect(page.getByRole("list", { name: /товар/i })).toBeVisible({
    timeout: 25_000,
  });

  let prevCount = 0;
  for (let attempt = 0; attempt < LOAD_MORE_ATTEMPTS; attempt += 1) {
    if ((await page.locator(".app-shell__grid-virtual-host").count()) > 0) {
      return;
    }

    const cardCount = await countCatalogCards(page);
    if (cardCount >= E2E_FIXTURE.virtualCatalogCount) {
      await page.waitForTimeout(SCROLL_PAUSE_MS);
      if ((await page.locator(".app-shell__grid-virtual-host").count()) > 0) {
        return;
      }
    }

    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    await page.waitForTimeout(SCROLL_PAUSE_MS);

    const nextCount = await countCatalogCards(page);
    if (nextCount === prevCount && nextCount >= E2E_FIXTURE.virtualCatalogCount - 1) {
      break;
    }
    prevCount = nextCount;
  }

  await expect(page.locator(".app-shell__grid-virtual-host")).toBeVisible({
    timeout: 15_000,
  });
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function expectVirtualCatalogHasVisibleCards(page) {
  const cards = page.locator(".app-shell__grid--virtual-window .product-card");
  await expect(cards.first()).toBeVisible({ timeout: 15_000 });
  expect(await cards.count()).toBeGreaterThan(0);
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function readVirtualizerMetrics(page) {
  return page.evaluate(() => {
    const host = document.querySelector(".app-shell__grid-virtual-host");
    const grid = document.querySelector(".app-shell__grid--virtual-window");
    const hostHeight = host instanceof HTMLElement ? host.offsetHeight : 0;
    const gridTop = grid instanceof HTMLElement ? parseFloat(getComputedStyle(grid).top) : 0;
    const cardCount = document.querySelectorAll(
      ".app-shell__grid--virtual-window .product-card",
    ).length;

    return {
      hostHeight,
      gridTop,
      cardCount,
      scrollY: window.scrollY,
      viewportHeight: window.visualViewport?.height ?? window.innerHeight,
    };
  });
}

test("mobile QA: scroll + resize/orientation держит карточки в DOM", async ({ page }) => {
  await waitForVirtualCatalog(page);
  await expectVirtualCatalogHasVisibleCards(page);

  const beforeScroll = await readVirtualizerMetrics(page);
  expect(beforeScroll.hostHeight).toBeGreaterThan(2000);

  await page.evaluate(() => {
    window.scrollTo(0, 2800);
  });
  await page.waitForTimeout(SCROLL_PAUSE_MS);

  const afterScroll = await readVirtualizerMetrics(page);
  expect(afterScroll.cardCount).toBeGreaterThan(0);
  expect(afterScroll.gridTop).toBeGreaterThan(0);
  expect(afterScroll.scrollY).toBeGreaterThan(500);

  await page.evaluate(() => {
    window.scrollTo(0, 5600);
  });
  await page.waitForTimeout(SCROLL_PAUSE_MS);
  await expectVirtualCatalogHasVisibleCards(page);

  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(SCROLL_PAUSE_MS);
  await page.evaluate(() => {
    window.scrollTo(0, 3200);
  });
  await page.waitForTimeout(SCROLL_PAUSE_MS);
  await expectVirtualCatalogHasVisibleCards(page);

  await page.setViewportSize({ width: 667, height: 375 });
  await page.waitForTimeout(SCROLL_PAUSE_MS);
  await expectVirtualCatalogHasVisibleCards(page);

  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await page.waitForTimeout(SCROLL_PAUSE_MS);
  await expectVirtualCatalogHasVisibleCards(page);

  const atBottom = await readVirtualizerMetrics(page);
  expect(atBottom.hostHeight).toBeGreaterThan(atBottom.viewportHeight);
  expect(atBottom.cardCount).toBeGreaterThan(0);
});

test("Android QA: visualViewport scroll синхронизирует окно", async ({ page }) => {
  await waitForVirtualCatalog(page);

  await page.evaluate(() => {
    window.scrollTo(0, 4000);
  });
  await page.waitForTimeout(SCROLL_PAUSE_MS);

  const metrics = await readVirtualizerMetrics(page);
  expect(metrics.cardCount).toBeGreaterThan(0);
  expect(metrics.hostHeight).toBeGreaterThan(metrics.viewportHeight);
});
