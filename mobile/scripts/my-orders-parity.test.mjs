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

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /MyOrdersPageToolbar/);
  assert.match(page, /ListHeaderComponent/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /compact/);
  assert.match(page, /onProductClick/);
  assert.match(page, /onConfirmDelivered/);
  assert.match(page, /loyaltyFlash/);
  assert.match(page, /myActionCount/);
  assert.doesNotMatch(page, /useOrdersScreenStyles/);

  assert.match(toolbar, /MY_ORDERS_PAGE_UI\.TITLE/);
  assert.match(toolbar, /resolveMyOrdersStatusFilterChipActiveColors/);
  assert.match(toolbar, /STATUS_FILTER_LABEL/);
});

test("my orders page ui copy matches web purchases wording", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /TITLE: "Мои покупки"/);
  assert.match(copy, /EMPTY: "У вас пока нет покупок\."/);
  assert.match(copy, /LOADING: "Загрузка покупок…"/);
});
