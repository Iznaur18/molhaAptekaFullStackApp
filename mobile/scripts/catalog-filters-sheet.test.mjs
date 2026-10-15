import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { createEmptyCatalogFiltersDraft } from "@izibuy/shared-lib";

import { buildHomeCatalogFiltersFacetsParams } from "../features/home-feed/lib/buildHomeCatalogFiltersFacetsParams.ts";
import {
  EMPTY_HOME_CATALOG_FEED_FILTERS,
  hasHomeCatalogFeedExtraFilters,
  homeCatalogFeedFiltersFromDraft,
  homeCatalogFeedFiltersToDraft,
  pickHomeCatalogFeedFilters,
} from "../features/home-feed/model/homeCatalogFeedFilters.ts";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("«Показать» с «Новинками» и без фильтров возвращает главную ленту", () => {
  const next = homeCatalogFeedFiltersFromDraft(
    createEmptyCatalogFiltersDraft(),
    EMPTY_HOME_CATALOG_FEED_FILTERS,
  );
  assert.equal(next.sort, undefined);
  assert.equal(hasHomeCatalogFeedExtraFilters(next), false);
  assert.deepEqual(next, EMPTY_HOME_CATALOG_FEED_FILTERS);
});

test("явные «Новинки» от плитки каталога не теряются при «Показать»", () => {
  const applied = pickHomeCatalogFeedFilters({ sort: "newest" });
  const next = homeCatalogFeedFiltersFromDraft(
    homeCatalogFeedFiltersToDraft(applied),
    applied,
  );
  assert.equal(next.sort, "newest");
});

test("черновик и лента переводятся друг в друга без потерь", () => {
  const applied = pickHomeCatalogFeedFilters({
    sort: "price_desc",
    saleOnly: true,
    priceMin: 100,
    priceMax: 900,
    delivery: ["carrier", "seller"],
    ratingMin: 4,
    sellerPremium: true,
  });
  assert.equal(hasHomeCatalogFeedExtraFilters(applied), true);
  const roundTrip = homeCatalogFeedFiltersFromDraft(
    homeCatalogFeedFiltersToDraft(applied),
    applied,
  );
  assert.deepEqual(roundTrip, applied);
  assert.deepEqual(roundTrip.delivery, ["seller", "carrier"]);
});

test("плитка с неизвестной сортировкой не ломает ленту", () => {
  assert.equal(pickHomeCatalogFeedFilters({ sort: "bogus" }).sort, undefined);
});

test("счётчики считаются по поиску и категории ленты, но без сортировки", () => {
  const draft = {
    ...createEmptyCatalogFiltersDraft(),
    sort: "price_asc",
    pickupOnly: true,
    priceMax: 500,
  };
  const params = buildHomeCatalogFiltersFacetsParams(
    {
      view: "main",
      search: "чай",
      categoryId: "c1",
      sort: "purchases",
      saleOnly: true,
      regionCode: "RU-MOW",
    },
    draft,
  );
  assert.equal(params.sort, undefined);
  assert.equal(params.search, "чай");
  assert.equal(params.categoryId, "c1");
  assert.equal(params.regionCode, "RU-MOW");
  assert.equal(params.pickupOnly, true);
  assert.equal(params.priceMax, 500);
  // Фильтры ленты заменяет черновик: в нём «Со скидкой» снята.
  assert.equal(params.saleOnly, false);
});

test("кнопка фильтров стоит в шапке главной, окно рендерится на экране", () => {
  assert.match(
    read("features/home-feed/ui/HomeCatalogSearchRow.tsx"),
    /<HomeCatalogFiltersButton/,
  );
  assert.match(read("app/(tabs)/index.tsx"), /<HomeCatalogFiltersSheet/);
});

test("запрос ленты передаёт фильтры окна на сервер", () => {
  const source = read("entities/product/api/fetchCatalogProductsPage.ts");
  for (const key of [
    "priceMin",
    "priceMax",
    "delivery",
    "pickupOnly",
    "ratingMin",
    "withReviews",
    "returnOnly",
    "sellerConfirmed",
    "sellerPremium",
  ]) {
    assert.match(source, new RegExp(`\\.\\.\\.\\(${key}`), key);
  }
});
