import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("search synonyms admin page mirrors web admin panel shell", () => {
  const page = readMobileFile("features/search-synonyms-admin-page/ui/SearchSynonymsAdminPage.tsx");
  const shell = readMobileFile("shared/ui/AdminPanelShell.tsx");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /AdminPanelShell/);
  assert.match(page, /SearchSynonymAdminCard/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /updateRows/);
  assert.match(page, /activeSectionId="search-synonyms-admin"/);
  assert.match(page, /TAB_SEARCH_SYNONYMS_ADMIN/);
  assert.doesNotMatch(page, /staffAdminStyles/);
  assert.doesNotMatch(page, /StaffModerationActions/);

  assert.match(shell, /ADMIN_PANEL_UI\.REFRESH/);
  assert.match(shell, /COUNT_FILTERED/);
  assert.match(shell, /toolbarPrimaryRow/);
  assert.match(shell, /toolbarActions/);
});

test("search synonym admin card mirrors web token and category chips", () => {
  const card = readMobileFile("features/search-synonyms-admin-page/ui/SearchSynonymAdminCard.tsx");

  assert.match(card, /PRODUCT_CATEGORY_LABEL_RU/);
  assert.match(card, /SynonymCategoryPicker/);
  assert.match(card, /DELETE_BUTTON/);
  assert.match(card, /LABEL_CATEGORIES/);
});

test("search synonyms admin ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /TITLE: "Синонимы поиска"/);
  assert.match(copy, /DELETE_BUTTON: "Удалить"/);
  assert.match(copy, /ADMIN_PANEL_UI/);
});
