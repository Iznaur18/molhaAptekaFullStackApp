import { expect, test } from "./helpers/test.js";

import { E2E_FIXTURE } from "./helpers/fixtures.js";

const SCROLL_PAUSE_MS = 500;
const LOAD_MORE_ATTEMPTS = 25;
const SEARCH_DEBOUNCE_MS = 1200;

/**
 * Товаров в ленте блоками: смонтированные карточки + ячейки свёрнутых блоков.
 *
 * @param {import('@playwright/test').Page} page
 */
async function countCatalogProducts(page) {
  return page.evaluate(() => {
    const feed = document.querySelector(".app-shell__grid-blocks");
    if (!feed) return 0;
    const mounted = feed.querySelectorAll(".app-shell__cell").length;
    const collapsed = [...feed.querySelectorAll("[data-catalog-block-count]")].reduce(
      (sum, block) => sum + Number(block.getAttribute("data-catalog-block-count")),
      0,
    );
    return mounted + collapsed;
  });
}

/**
 * Изолируем e2e-товары без tier-3 баннеров (они выключают ленту блоками) и
 * догружаем все страницы.
 *
 * @param {import('@playwright/test').Page} page
 */
async function waitForBlockCatalog(page) {
  await page.goto("/");
  await page
    .getByRole("searchbox", { name: "Поиск товаров" })
    .fill(E2E_FIXTURE.virtualCatalogPrefix);
  await page.waitForTimeout(SEARCH_DEBOUNCE_MS);

  await expect(page.locator(".app-shell__grid-blocks")).toBeVisible({
    timeout: 25_000,
  });

  let prevCount = 0;
  for (let attempt = 0; attempt < LOAD_MORE_ATTEMPTS; attempt += 1) {
    const count = await countCatalogProducts(page);
    if (count >= E2E_FIXTURE.virtualCatalogCount) {
      return;
    }
    if (count === prevCount && count >= E2E_FIXTURE.virtualCatalogCount - 1) {
      return;
    }
    prevCount = count;

    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    await page.waitForTimeout(SCROLL_PAUSE_MS);
  }

  expect(await countCatalogProducts(page)).toBeGreaterThanOrEqual(
    E2E_FIXTURE.virtualCatalogCount - 1,
  );
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function readBlockFeedMetrics(page) {
  return page.evaluate(() => {
    const intersectsViewport = (element) => {
      const rect = element.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };
    const cards = [
      ...document.querySelectorAll(".app-shell__grid-blocks .product-card"),
    ];
    const collapsed = [
      ...document.querySelectorAll(".app-shell__grid-block--collapsed"),
    ];

    return {
      blocks: document.querySelectorAll(".app-shell__grid-block").length,
      collapsedBlocks: collapsed.length,
      mountedCards: cards.length,
      cardsInViewport: cards.filter(intersectsViewport).length,
      collapsedInViewport: collapsed.filter(intersectsViewport).length,
      feedHeight:
        document.querySelector(".app-shell__grid-blocks")?.getBoundingClientRect()
          .height ?? 0,
      scrollY: window.scrollY,
      viewportHeight: window.visualViewport?.height ?? window.innerHeight,
    };
  });
}

/**
 * На экране карточки, а не заглушки свёрнутых блоков.
 *
 * @param {import('@playwright/test').Page} page
 */
async function expectCardsOnScreen(page) {
  await expect
    .poll(async () => {
      const metrics = await readBlockFeedMetrics(page);
      return metrics.cardsInViewport > 0 && metrics.collapsedInViewport === 0;
    })
    .toBe(true);
}

test("mobile QA: scroll + resize/orientation держит карточки на экране", async ({
  page,
}) => {
  await waitForBlockCatalog(page);
  await expectCardsOnScreen(page);

  const beforeScroll = await readBlockFeedMetrics(page);
  expect(beforeScroll.feedHeight).toBeGreaterThan(2000);

  await page.evaluate(() => {
    window.scrollTo(0, 2800);
  });
  await page.waitForTimeout(SCROLL_PAUSE_MS);
  await expectCardsOnScreen(page);
  expect((await readBlockFeedMetrics(page)).scrollY).toBeGreaterThan(500);

  await page.evaluate(() => {
    window.scrollTo(0, 5600);
  });
  await page.waitForTimeout(SCROLL_PAUSE_MS);
  await expectCardsOnScreen(page);
  // Дальние от экрана блоки свёрнуты: в DOM не вся лента.
  await expect
    .poll(async () => (await readBlockFeedMetrics(page)).collapsedBlocks)
    .toBeGreaterThan(0);

  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(SCROLL_PAUSE_MS);
  await page.evaluate(() => {
    window.scrollTo(0, 3200);
  });
  await page.waitForTimeout(SCROLL_PAUSE_MS);
  await expectCardsOnScreen(page);

  // На сенсорных устройствах ландшафт закрыт намеренно
  // (enablePortraitOrientationLock): приложение прячется под подсказкой
  // «поверните устройство». Проверяем блокировку и возвращаем портрет —
  // лента должна пережить разворот туда и обратно.
  await page.setViewportSize({ width: 667, height: 375 });
  await expect(page.locator("html.app-portrait-lock-active")).toHaveCount(1);

  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator("html.app-portrait-lock-active")).toHaveCount(0);
  await page.waitForTimeout(SCROLL_PAUSE_MS);
  await expectCardsOnScreen(page);

  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await page.waitForTimeout(SCROLL_PAUSE_MS);
  await expectCardsOnScreen(page);

  const atBottom = await readBlockFeedMetrics(page);
  expect(atBottom.feedHeight).toBeGreaterThan(atBottom.viewportHeight);
  expect(atBottom.mountedCards).toBeGreaterThan(0);
});

test("Android QA: глубокая прокрутка держит карточки на экране, дальние блоки свёрнуты", async ({
  page,
}) => {
  await waitForBlockCatalog(page);

  await page.evaluate(() => {
    window.scrollTo(0, 4000);
  });
  await page.waitForTimeout(SCROLL_PAUSE_MS);
  await expectCardsOnScreen(page);

  await expect
    .poll(async () => (await readBlockFeedMetrics(page)).collapsedBlocks)
    .toBeGreaterThan(0);
  const metrics = await readBlockFeedMetrics(page);
  expect(metrics.mountedCards).toBeLessThan(E2E_FIXTURE.virtualCatalogCount);
  expect(metrics.feedHeight).toBeGreaterThan(metrics.viewportHeight);
});
