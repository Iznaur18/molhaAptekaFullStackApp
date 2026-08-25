import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// Модуль импортирует только контракт — Node 24 стрипает типы и гоняет логику.
import {
  formatFlashSaleCountdown,
  isProductFlashSaleActive,
  normalizeStaleFlashSaleProduct,
  resolveFlashSaleCountdownParts,
  resolveFlashSaleRestoreBasePrice,
  resolveProductFlashSaleBorderProgress,
  resolveProductFlashSaleEndsAtMs,
} from "../entities/product/lib/isProductFlashSaleActive.ts";
import { hasProductManualCatalogDiscount } from "../entities/product/lib/hasProductManualCatalogDiscount.ts";
import { mixHexColors } from "../shared/lib/mixHexColors.ts";

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(mobileRoot, "..");

const readMobileFile = (relativePath) =>
  readFileSync(resolve(mobileRoot, relativePath), "utf8");
const readRepoFile = (relativePath) =>
  readFileSync(resolve(repoRoot, relativePath), "utf8");

const NOW = Date.UTC(2026, 7, 25, 12, 0, 0);

const activeProduct = (overrides = {}) => ({
  _id: "p1",
  productFlashSaleEnabled: true,
  productFlashSaleEndsAt: new Date(NOW + 60_000).toISOString(),
  productFlashSaleBasePrice: 1000,
  productFlashSaleDurationMinutes: 2,
  productOldPrice: 1000,
  productPrice: 700,
  ...overrides,
});

test("активна, пока конец в будущем", () => {
  assert.equal(isProductFlashSaleActive(activeProduct(), NOW), true);
  assert.equal(
    isProductFlashSaleActive(
      activeProduct({ productFlashSaleEndsAt: new Date(NOW - 1).toISOString() }),
      NOW,
    ),
    false,
  );
});

test("выключенный флаг важнее даты", () => {
  assert.equal(
    isProductFlashSaleActive(activeProduct({ productFlashSaleEnabled: false }), NOW),
    false,
  );
});

test("без даты окончания скидки нет", () => {
  assert.equal(
    isProductFlashSaleActive(activeProduct({ productFlashSaleEndsAt: null }), NOW),
    false,
  );
  assert.equal(resolveProductFlashSaleEndsAtMs({ productFlashSaleEndsAt: null }), null);
});

test("прогресс рамки — доля оставшегося времени", () => {
  // осталась 1 минута из 2 → половина
  assert.equal(resolveProductFlashSaleBorderProgress(activeProduct(), NOW), 0.5);
  assert.equal(
    resolveProductFlashSaleBorderProgress(activeProduct(), NOW + 60_000),
    0,
  );
  // без длительности прогресс не посчитать — рисуется статичная рамка
  assert.equal(
    resolveProductFlashSaleBorderProgress(
      activeProduct({ productFlashSaleDurationMinutes: null }),
      NOW,
    ),
    null,
  );
});

test("формат отсчёта: дни появляются только когда они есть", () => {
  assert.equal(formatFlashSaleCountdown(59), "00:00:59");
  assert.equal(formatFlashSaleCountdown(3661), "01:01:01");
  assert.equal(formatFlashSaleCountdown(90061), "1д 01:01:01");
  assert.equal(formatFlashSaleCountdown(-5), "00:00:00");

  assert.deepEqual(resolveFlashSaleCountdownParts(3661), {
    showDays: false,
    days: null,
    hours: "01",
    minutes: "01",
    seconds: "01",
  });
  assert.deepEqual(resolveFlashSaleCountdownParts(90061), {
    showDays: true,
    days: "1",
    hours: "01",
    minutes: "01",
    seconds: "01",
  });
});

test("базовая цена восстановления берётся из snapshot, потом из старой цены", () => {
  assert.equal(resolveFlashSaleRestoreBasePrice(activeProduct()), 1000);
  assert.equal(
    resolveFlashSaleRestoreBasePrice(
      activeProduct({ productFlashSaleBasePrice: null, productOldPrice: 1200 }),
    ),
    1200,
  );
  assert.equal(
    resolveFlashSaleRestoreBasePrice({ productPrice: 700, productOldPrice: 500 }),
    null,
  );
});

test("истёкшая скидка гасится на клиенте и возвращает цену", () => {
  const stale = activeProduct({
    productFlashSaleEndsAt: new Date(NOW - 1000).toISOString(),
  });
  const normalized = normalizeStaleFlashSaleProduct(stale, NOW);

  assert.equal(normalized.productFlashSaleEnabled, false);
  assert.equal(normalized.productPrice, 1000);
  assert.equal(normalized.productOldPrice, null);
  assert.equal(normalized.productFlashSaleEndsAt, null);
});

test("активная скидка нормализацию переживает без изменений", () => {
  const product = activeProduct();
  assert.equal(normalizeStaleFlashSaleProduct(product, NOW), product);
});

test("ручная скидка не считается ручной во время горящей", () => {
  assert.equal(hasProductManualCatalogDiscount({ productOldPrice: 1000, productPrice: 700 }), true);
  assert.equal(hasProductManualCatalogDiscount(activeProduct()), false);
  assert.equal(hasProductManualCatalogDiscount({ productPrice: 700 }), false);
});

test("mixHexColors повторяет color-mix", () => {
  assert.equal(mixHexColors("#ffffff", "#000000", 0.5), "#808080");
  assert.equal(mixHexColors("#ffffff", "#000000", 1), "#ffffff");
  assert.equal(mixHexColors("#ffffff", "#000000", 0), "#000000");
  assert.equal(mixHexColors("#fff", "#000", 0.5), "#808080");
  // невалидный вход не роняет стили
  assert.equal(mixHexColors("rgba(0,0,0,0.5)", "#000000", 0.5), "rgba(0,0,0,0.5)");
});

test("копирайт бейджа совпадает с вебом", () => {
  const web = readRepoFile("client/src/shared/config/copy/product-flash-sale.js");
  const mobile = readMobileFile("shared/config/appUiCopy.ts");

  for (const line of [
    'MANAGE_TITLE: "Горящая скидка"',
    'DETAILS_COUNTDOWN_LABEL: "До конца акции"',
    'DETAILS_COUNTDOWN_EXPIRED: "Акция завершена"',
    'MODAL_ERROR_PRICE: "Цена со скидкой должна быть меньше обычной"',
  ]) {
    assert.ok(web.includes(line), `нет в вебе: ${line}`);
    assert.ok(mobile.includes(line), `нет в мобилке: ${line}`);
  }
});

test("плитка каталога есть и стоит там же, где в вебе", () => {
  const mobileTiles = readMobileFile(
    "entities/product-category-display/lib/catalogFeedTiles.ts",
  );
  const webTiles = readRepoFile(
    "client/src/entities/product-category-display/lib/buildCatalogFeedTiles.js",
  );

  assert.match(mobileTiles, /__flash_sale_only__/);

  // Режем по началу массива: до него идут объявления констант и импорты,
  // их порядок к раскладке плиток отношения не имеет.
  const tilesBody = (source) => source.slice(source.indexOf("CATALOG_FEED_TILES"));
  const orderIn = (source, marker) => tilesBody(source).indexOf(marker);

  // В обоих файлах плитка стоит между «Проверенными» и «Подписками».
  for (const [name, source] of [
    ["mobile", mobileTiles],
    ["web", webTiles],
  ]) {
    const confirmedAt = orderIn(source, "CATALOG_SORT_CONFIRMED");
    const flashAt = orderIn(source, "CATALOG_FILTER_FLASH_SALE_ONLY");
    const followingAt = orderIn(source, "CATALOG_FILTER_FOLLOWING_ONLY");

    assert.ok(confirmedAt >= 0 && flashAt >= 0 && followingAt >= 0, name);
    assert.ok(confirmedAt < flashAt, `${name}: плитка выше «Проверенных»`);
    assert.ok(flashAt < followingAt, `${name}: плитка ниже «Подписок»`);
  }
});

test("фильтр flashSaleOnly доезжает до запроса каталога", () => {
  const api = readMobileFile("entities/product/api/fetchCatalogProductsPage.ts");
  assert.match(api, /flashSaleOnly \? \{ flashSaleOnly: "true" \} : \{\}/);

  const filters = readMobileFile("entities/product/model/catalogListFilters.ts");
  assert.match(filters, /flashSaleOnly\?: boolean;/);
  assert.match(filters, /flashSaleOnly: filters\.flashSaleOnly === true/);
});

test("бейдж карточки стоит между «рядом» и «розыгрышем», как в вебе", () => {
  const badges = readMobileFile("entities/product/ui/ProductCatalogStatusBadges.tsx");
  const nearAt = badges.indexOf('key: "near"');
  const flashAt = badges.indexOf('key: "flash-sale"');
  const raffleAt = badges.indexOf('key: "raffle"');

  assert.ok(nearAt >= 0 && flashAt >= 0 && raffleAt >= 0);
  assert.ok(nearAt < flashAt && flashAt < raffleAt);
});

test("включение скидки идёт только через модалку", () => {
  const manage = readMobileFile("entities/product/ui/ProductEditManageSection.tsx");
  // При next === true строка открывает настройки и откатывает тумблер.
  assert.match(manage, /if \(next\) \{\s*\r?\n\s*onOpenFlashSaleSettings\?\.\(\);/);
  assert.match(manage, /flashSaleBlockedByAuction/);
  assert.match(manage, /flashSaleBlockedByManualDiscount/);
});

test("корзина пересчитывает цены по тику", () => {
  const cart = readMobileFile("app/(tabs)/cart.tsx");
  assert.match(cart, /useCartFlashSalePriceTick/);
  assert.match(cart, /cartPriceNowMs/);

  const select = readMobileFile("entities/cart/lib/selectCartLines.ts");
  assert.match(select, /normalizeStaleFlashSaleProduct\(rawProduct, nowMs\)/);
});
