import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("my sales page mirrors web toolbar, search and seller order card", () => {
  const page = readMobileFile("features/my-sales-page/ui/MySalesPage.tsx");
  const toolbar = readMobileFile("features/my-sales-page/ui/MySalesPageToolbar.tsx");
  const orderCard = readMobileFile("entities/order/ui/OrderCard.tsx");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /MySalesPageToolbar/);
  assert.match(page, /ListHeaderComponent/);
  assert.match(page, /useDebouncedValue/);
  assert.match(page, /normalizeTotalSalesCount/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /compact/);
  assert.match(page, /showBuyer/);
  assert.match(page, /onBuyerNameClick/);
  assert.match(page, /onProductClick/);
  assert.match(page, /ORDER_CARD_UI\.CANCEL_CONFIRM/);
  assert.match(page, /salesActionCount/);
  assert.match(page, /EMPTY_BY_SEARCH/);

  assert.match(toolbar, /MY_SALES_PAGE_UI\.TITLE/);
  assert.match(toolbar, /TOTAL_SALES_COUNT/);
  assert.match(toolbar, /SEARCH_PLACEHOLDER/);
  assert.match(toolbar, /resolveMySalesStatusFilterChipActiveColors/);

  assert.match(orderCard, /OrderCardLineItemThumb/);
  assert.match(orderCard, /itemsList/);
  assert.doesNotMatch(orderCard, /ITEMS_HEADING/);
  assert.match(orderCard, /showBuyer/);
  assert.match(orderCard, /compact/);
  assert.match(orderCard, /DETAILS_FOLD_SUMMARY/);
  assert.match(orderCard, /resolveOrderStatusBadgeStyle/);
  assert.match(orderCard, /installmentBadge/);
  assert.match(orderCard, /actionButton/);
});

test("my sales query passes status and search filters", () => {
  const query = readMobileFile("entities/order/model/useMySalesQuery.ts");

  assert.match(query, /search/);
  assert.match(query, /status/);
});
