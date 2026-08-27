import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { resolveCatalogEmptyReason } from "../entities/product/lib/resolveCatalogEmptyReason.ts";

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(mobileRoot, "..");
const readMobileFile = (p) => readFileSync(resolve(mobileRoot, p), "utf8");
const readRepoFile = (p) => readFileSync(resolve(repoRoot, p), "utf8");

test("каждый фильтр объясняет пустоту по-своему", () => {
  assert.equal(resolveCatalogEmptyReason({}), "generic");
  assert.equal(resolveCatalogEmptyReason({ near: true }), "near");
  assert.equal(resolveCatalogEmptyReason({ saleOnly: true }), "sale");
  assert.equal(resolveCatalogEmptyReason({ rentalOnly: true }), "rental");
  assert.equal(resolveCatalogEmptyReason({ affiliateOnly: true }), "affiliate");
  assert.equal(resolveCatalogEmptyReason({ wholesaleOnly: true }), "wholesale");
  assert.equal(resolveCatalogEmptyReason({ originalOnly: true }), "original");
  assert.equal(resolveCatalogEmptyReason({ installmentOnly: true }), "installment");
  assert.equal(resolveCatalogEmptyReason({ followingOnly: true }), "following");
  // Аукцион в вебе делит текст с подписками — отдельного нет.
  assert.equal(resolveCatalogEmptyReason({ auctionOnly: true }), "following");
  assert.equal(resolveCatalogEmptyReason({ hasSelectedCategory: true }), "category");
});

test("поиск перебивает любой фильтр", () => {
  // Иначе по пустому запросу внутри фильтра показывалось бы «нет товаров с
  // оптовой ценой», хотя виноват запрос.
  assert.equal(
    resolveCatalogEmptyReason({ hasQuery: true, wholesaleOnly: true, near: true }),
    "query",
  );
  assert.equal(
    resolveCatalogEmptyReason({ hasQuery: true, hasSelectedCategory: true }),
    "query",
  );
  assert.equal(
    resolveCatalogEmptyReason({ hasQuery: true, isMineMode: true }),
    "query",
  );
});

test("фильтр перебивает категорию", () => {
  // Продавец с включённым «только опт» не должен читать «в категории пусто».
  assert.equal(
    resolveCatalogEmptyReason({ hasSelectedCategory: true, wholesaleOnly: true }),
    "wholesale",
  );
});

test("в режиме «мои товары» фильтры каталога не применяются", () => {
  // В вебе все проверки фильтров стоят под `!isMineMode`.
  assert.equal(resolveCatalogEmptyReason({ isMineMode: true, saleOnly: true }), "mine");
  assert.equal(resolveCatalogEmptyReason({ isMineMode: true, near: true }), "mine");
  assert.equal(
    resolveCatalogEmptyReason({ isMineMode: true, hasSelectedCategory: true }),
    "mineFiltered",
  );
  assert.equal(
    resolveCatalogEmptyReason({
      isMineMode: true,
      hasModerationFilter: true,
      hasSelectedCategory: true,
    }),
    "mineByModerationStatus",
  );
});

test("тексты совпадают с вебом дословно", () => {
  const webCopy = readRepoFile("client/src/shared/config/copy/catalog.js");
  // Только блок CATALOG_EMPTY_MESSAGE: ключи вроде `rental:` встречаются и в
  // других неймспейсах, и поиск по всему файлу цепляет чужой текст.
  const allMobileCopy = readMobileFile("shared/config/appUiCopy.ts");
  const blockStart = allMobileCopy.indexOf("export const CATALOG_EMPTY_MESSAGE");
  assert.ok(blockStart >= 0, "нет блока CATALOG_EMPTY_MESSAGE");
  const mobileCopy = allMobileCopy.slice(blockStart).split("};")[0];

  const pairs = [
    ["EMPTY_BY_QUERY", "query"],
    ["EMPTY_NEAR_FILTER", "near"],
    ["EMPTY_SALE_FILTER", "sale"],
    ["EMPTY_RENTAL_FILTER", "rental"],
    ["EMPTY_AFFILIATE_FILTER", "affiliate"],
    ["EMPTY_WHOLESALE_FILTER", "wholesale"],
    ["EMPTY_ORIGINAL_FILTER", "original"],
    ["EMPTY_INSTALLMENT_FILTER", "installment"],
    ["EMPTY_FOLLOWING_FILTER", "following"],
    ["EMPTY_MY_BY_MODERATION_STATUS", "mineByModerationStatus"],
    ["EMPTY_MY_FILTERED", "mineFiltered"],
    ["EMPTY_MY_PRODUCTS", "mine"],
    ["EMPTY_CATEGORY", "category"],
    ["EMPTY_NO_PRODUCTS", "generic"],
  ];

  for (const [webKey, reason] of pairs) {
    const webText = new RegExp(`${webKey}:\\s*"([^"]+)"`).exec(webCopy)?.[1];
    assert.ok(webText, `в вебе нет ${webKey}`);
    const mobileText = new RegExp(`\\b${reason}:\\s*"([^"]+)"`).exec(mobileCopy)?.[1];
    assert.equal(mobileText, webText, `текст «${reason}» разошёлся с вебом`);
  }

  // Ровно столько причин, сколько текстов — новая причина без текста не пройдёт.
  const lib = readMobileFile("entities/product/lib/resolveCatalogEmptyReason.ts");
  const reasons = [...lib.matchAll(/^\s{2}\| "([a-zA-Z]+)"$/gm)].map((m) => m[1]);
  assert.equal(reasons.length + 1, pairs.length, "число причин разошлось с числом текстов");
});

test("упавшая догрузка показывает ошибку и «Повторить»", () => {
  const screen = readMobileFile("app/(tabs)/index.tsx");
  assert.ok(
    screen.includes("catalogQuery.isFetchNextPageError"),
    "ошибка догрузки не отслеживается",
  );
  assert.ok(screen.includes("CATALOG_LOAD_MORE_UI.RETRY"), "нет кнопки «Повторить»");
  assert.ok(screen.includes("CATALOG_LOAD_MORE_UI.FAIL"), "нет текста ошибки догрузки");
  // Без этого onEndReached после ошибки зациклил бы запросы.
  assert.ok(
    /!catalogQuery\.isFetchNextPageError\s*\n?\s*\)\s*\{/.test(screen),
    "догрузка обязана останавливаться после ошибки",
  );
  // Оба списка экрана (лента и сетка) должны показывать один и тот же футер.
  assert.equal(
    (screen.match(/\{loadMoreFooter\}/g) ?? []).length,
    2,
    "футер догрузки должен быть в обоих списках",
  );

  const webCopy = readRepoFile("client/src/shared/config/copy/catalog.js");
  assert.match(webCopy, /CATALOG_LOAD_MORE_RETRY: "Повторить"/);
});

test("общий текст на главной больше не используется", () => {
  const screen = readMobileFile("app/(tabs)/index.tsx");
  assert.ok(
    screen.includes("resolveCatalogEmptyReason({"),
    "главная не разбирает причину пустоты",
  );
  assert.ok(
    !screen.includes("API_CLIENT_UI.CATALOG_EMPTY_NEAR"),
    "остался старый двухвариантный текст",
  );
});
