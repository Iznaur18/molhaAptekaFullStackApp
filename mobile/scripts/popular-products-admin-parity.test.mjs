import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("popular products admin page mirrors web admin panel shell", () => {
  const page = readMobileFile("features/popular-products-admin-page/ui/PopularProductsAdminPage.tsx");
  const hook = readMobileFile("features/popular-products-admin-page/model/usePopularProductsAdminPage.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /AdminPanelShell/);
  assert.match(page, /CuratedProductListAdminCard/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /activeSectionId="popular-products-admin"/);
  assert.match(page, /TAB_POPULAR_PRODUCTS_ADMIN/);
  assert.doesNotMatch(page, /staffAdminStyles/);
  assert.doesNotMatch(page, /ADD_CREATE/);

  assert.match(hook, /updateListsCache/);
  assert.match(hook, /curatedProductListAdminQueryKeys/);
  assert.match(hook, /invalidateCuratedProductLists/);
  assert.match(hook, /REORDER_ERROR/);
});

test("curated product list admin card mirrors web reorder and product rows", () => {
  const card = readMobileFile("features/popular-products-admin-page/ui/CuratedProductListAdminCard.tsx");

  assert.match(card, /MOVE_UP_ARIA/);
  assert.match(card, /MOVE_DOWN_ARIA/);
  assert.match(card, /PRODUCT_ID_PLACEHOLDER/);
  assert.match(card, /useAdminPanelStyles/);
  assert.doesNotMatch(card, /staffAdminStyles/);
});

test("popular products admin ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /TITLE: "Популярные товары"/);
  assert.match(copy, /REORDER_ERROR: "Не удалось изменить порядок"/);
  assert.match(copy, /PRODUCT_ID_PLACEHOLDER: "MongoDB ObjectId товара"/);
});
