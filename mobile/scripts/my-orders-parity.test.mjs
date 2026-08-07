import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("my orders page mirrors web toolbar and compact buyer order card", () => {
  const page = readMobileFile("features/my-orders-page/ui/MyOrdersPage.tsx");
  const toolbar = readMobileFile("features/my-orders-page/ui/MyOrdersPageToolbar.tsx");
  const overview = readMobileFile("features/my-orders-page/ui/MyOrdersPageOverview.tsx");
  const orderCard = readMobileFile("entities/order/ui/OrderCard.tsx");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /MyOrdersPageToolbar/);
  assert.match(page, /MyOrdersPageOverview/);
  assert.match(page, /projectMyOrdersSellerBlocks/);
  assert.match(page, /orderMatchesMyOrdersFilters/);
  assert.match(page, /filterMyOrders|orderMatchesMyOrdersFilters/);
  assert.match(page, /summarizeMyOrders/);
  assert.match(page, /blockKey/);
  assert.doesNotMatch(page, /EXPAND_ALL/);
  assert.doesNotMatch(page, /collapsible/);
  assert.match(page, /COUNT_FILTERED/);
  assert.match(page, /ListHeaderComponent/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /compact/);
  assert.match(page, /onProductClick/);
  assert.match(page, /onConfirmDelivered/);
  assert.match(page, /loyaltyFlash/);
  assert.match(page, /myActionCount/);
  assert.match(page, /ATTENTION_FILTER_HINT/);
  assert.doesNotMatch(page, /useOrdersScreenStyles/);

  assert.match(toolbar, /MY_ORDERS_PAGE_UI\.TITLE/);
  assert.match(toolbar, /summaryCountLabel/);
  assert.match(toolbar, /resolveMyOrdersStatusFilterChipActiveColors/);
  assert.match(toolbar, /STATUS_FILTER_LABEL/);

  assert.match(overview, /OVERVIEW_IN_PROGRESS/);
  assert.match(overview, /OVERVIEW_ATTENTION/);
  assert.match(overview, /OVERVIEW_TOTAL/);

  assert.match(orderCard, /collapsible/);
  assert.match(orderCard, /orderNeedsBuyerAttention/);
});

test("my orders page ui copy matches web purchases wording", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");
  const ordersUi = copy.match(/export const MY_ORDERS_PAGE_UI = \{[\s\S]*?\n\} as const;/);

  assert.ok(ordersUi);
  assert.match(ordersUi[0], /TITLE: "Мои покупки"/);
  assert.match(ordersUi[0], /EMPTY: "У вас пока нет покупок\."/);
  assert.match(ordersUi[0], /LOADING: "Загрузка покупок…"/);
  assert.match(ordersUi[0], /COUNT_FILTERED:/);
  assert.doesNotMatch(ordersUi[0], /EXPAND_ALL/);
  assert.doesNotMatch(ordersUi[0], /COLLAPSE_ALL/);
  assert.match(ordersUi[0], /OVERVIEW_ATTENTION: "Нужно действие"/);
});
