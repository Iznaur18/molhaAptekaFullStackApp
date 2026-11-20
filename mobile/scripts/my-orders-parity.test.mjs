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
  const overview = readMobileFile(
    "features/my-orders-page/ui/MyOrdersPageOverview.tsx",
  );
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
  assert.match(page, /listInAccountShell/);
  assert.match(page, /useProfileAdaptiveLayout/);
  assert.match(page, /listItemFirst/);
  assert.match(page, /ProfileAccountList/);
  assert.match(page, /compact/);

  const pageStyles = readMobileFile("shared/theme/myOrdersPageStyles.ts");
  assert.match(pageStyles, /MY_ORDERS_PAGE_LAYOUT/);
  assert.match(pageStyles, /listInAccountShell/);
  assert.match(pageStyles, /paddingTop:\s*0/);
  assert.match(pageStyles, /listItemFirst/);

  const layout = readMobileFile("shared/lib/guestProfileLayout.ts");
  assert.match(layout, /MY_ORDERS_PAGE_LAYOUT/);
  assert.match(layout, /stackGap: 13\.6/);

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
  const ordersUi = copy.match(
    /export const MY_ORDERS_PAGE_UI = \{[\s\S]*?\n\} as const;/,
  );

  assert.ok(ordersUi);
  assert.match(ordersUi[0], /TITLE: "Мои покупки"/);
  assert.match(ordersUi[0], /EMPTY: "У вас пока нет покупок\."/);
  assert.match(ordersUi[0], /LOADING: "Загрузка покупок…"/);
  assert.match(ordersUi[0], /COUNT_FILTERED:/);
  assert.doesNotMatch(ordersUi[0], /EXPAND_ALL/);
  assert.doesNotMatch(ordersUi[0], /COLLAPSE_ALL/);
  assert.match(ordersUi[0], /OVERVIEW_ATTENTION: "Нужно действие"/);
  assert.match(ordersUi[0], /AUTH_REQUIRED: "Войдите, чтобы видеть покупки"/);
});

test("my orders overview active tile uses action colors like web", () => {
  const styles = readMobileFile("shared/theme/myOrdersPageStyles.ts");
  assert.match(
    styles,
    /overviewTileActive:[\s\S]*borderColor:\s*theme\.colors\.action[\s\S]*backgroundColor:\s*theme\.colors\.actionSoft/,
  );
  assert.doesNotMatch(
    styles,
    /overviewTileActive:[\s\S]*theme\.colors\.success/,
  );
});

test("my orders guest CTA matches cart centered + AppButton", () => {
  const page = readMobileFile("features/my-orders-page/ui/MyOrdersPage.tsx");
  const styles = readMobileFile("shared/theme/myOrdersPageStyles.ts");
  assert.match(page, /MY_ORDERS_PAGE_UI\.AUTH_REQUIRED/);
  assert.match(page, /AppButton/);
  assert.match(page, /AUTH_UI\.LOGIN_BUTTON/);
  assert.doesNotMatch(page, /styles\.buttonText/);
  assert.match(styles, /hint:[\s\S]*fontSize:\s*16[\s\S]*marginBottom:\s*theme\.spacing\[4\]/);
});

test("buyer compact order-card matches web pad/gap/details-fold", () => {
  const card = readMobileFile("entities/order/ui/OrderCard.tsx");
  const styles = readMobileFile("shared/theme/commerceScreenStyles.ts");
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(card, /compact \? styles\.cardCompact/);
  assert.match(card, /compact \? styles\.headerCompact/);
  assert.match(card, /styles\.detailsFold/);
  assert.match(styles, /cardCompact:[\s\S]*padding: 14[\s\S]*gap: 8/);
  assert.match(styles, /headerCompact:[\s\S]*marginBottom: 0[\s\S]*gap: 8/);
  assert.match(
    styles,
    /detailsFold:[\s\S]*borderRadius: 14[\s\S]*backgroundColor:\s*theme\.colors\.surfaceMuted/,
  );
  assert.match(
    styles,
    /detailsFoldSummary:[\s\S]*fontSize: 12\.8[\s\S]*color:\s*theme\.colors\.textSecondary/,
  );
  assert.match(styles, /detailsFoldBody:[\s\S]*gap: 7\.2/);
  assert.match(copy, /EMPTY_BY_FILTER: "По выбранному статусу покупок нет\."/);
  assert.match(copy, /DETAILS_FOLD_SUMMARY: "Подробности заказа"/);
});
