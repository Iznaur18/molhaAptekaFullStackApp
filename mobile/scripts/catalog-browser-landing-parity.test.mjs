import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT = join(ROOT, "../client/src");

const readMobile = (p) => readFileSync(join(ROOT, p), "utf8");
const readClient = (p) => readFileSync(join(CLIENT, p), "utf8");

test("catalog browser landing: mobile без personal tiles, как web", () => {
  const page = readMobile("features/catalog-browser/ui/CatalogBrowserPage.tsx");
  const webLanding = readClient(
    "entities/product-category-display/ui/CatalogBrowserLanding.jsx",
  );

  assert.doesNotMatch(page, /useSellerPersonalCategoryCatalogTilesQuery/);
  assert.doesNotMatch(page, /personalCategoryTiles/);
  assert.doesNotMatch(page, /handlePersonalCategoryPress/);
  assert.doesNotMatch(page, /SELLER_PERSONAL_CATEGORY_PAGE_UI/);
  assert.doesNotMatch(page, /TILES_SECTION_TITLE/);

  assert.match(page, /variant="feed"/);
  assert.match(page, /PRODUCT_CATEGORY_DISPLAY_UI\.CATEGORIES_SECTION_TITLE/);
  assert.match(page, /setPendingCatalogFilters/);
  assert.match(page, /router\.replace\("\/\(tabs\)"\)/);

  assert.doesNotMatch(webLanding, /sellerPersonal|personalCategor/i);
  assert.match(webLanding, /CatalogFeedTilesGrid|feed/i);
});

test("personal tiles остаются на home вкладке Продавцы", () => {
  const sellers = readMobile("features/home-feed/ui/HomeFeedSellersSection.tsx");
  assert.match(sellers, /useSellerPersonalCategoryCatalogTilesQuery|sellerPersonal/i);
});
