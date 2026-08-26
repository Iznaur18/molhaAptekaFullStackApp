import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("wishlist page mirrors web hub chrome and list", () => {
  const page = readMobileFile("features/wishlist-page/ui/WishlistPage.tsx");
  const styles = readMobileFile("shared/theme/wishlistPageStyles.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /useProfileAdaptiveLayout/);
  assert.match(page, /listInAccountShell/);
  assert.match(page, /emptyInAccountShell/);
  assert.match(page, /WishlistRow/);
  assert.match(page, /activeSectionId="wishlist"/);
  assert.match(page, /TAB_WISHLIST/);
  assert.doesNotMatch(page, /commerceScreenStyles/);

  assert.match(styles, /PRODUCT_IMAGE_THUMB_SIDE/);
  assert.match(styles, /loginButton/);
  assert.match(styles, /WISHLIST_PAGE_LAYOUT/);
  assert.match(styles, /listInAccountShell/);
  assert.match(styles, /paddingTop:\s*0/);
});

test("wishlist row mirrors web row layout", () => {
  const row = readMobileFile("features/wishlist-page/ui/WishlistRow.tsx");

  assert.match(row, /headingButton/);
  assert.match(row, /REMOVE_ARIA/);
  assert.match(row, /formatPriceRub/);
  assert.match(row, /MaterialIcons/);
});

test("wishlist ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /Загрузка списка…/);
  assert.match(copy, /Список пуст. Добавляйте товары из каталога./);
  assert.match(copy, /Войдите, чтобы видеть «Мои желания»./);
});
