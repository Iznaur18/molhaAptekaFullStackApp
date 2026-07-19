import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("catalog browser opens subcategory picker before leaf category products", () => {
  const page = readMobileFile("features/catalog-browser/ui/CatalogBrowserPage.tsx");
  const hook = readMobileFile("features/catalog-browser/model/useCatalogSubcategoryPicker.ts");
  const picker = readMobileFile("features/catalog-browser/ui/CatalogSubcategoryPicker.tsx");
  const tiles = readMobileFile(
    "entities/product-category-display/lib/buildCatalogSubcategoryPickerTiles.ts",
  );

  assert.match(page, /CatalogSubcategoryPicker/);
  assert.match(page, /useCatalogSubcategoryPicker/);
  assert.match(page, /handleCatalogCategoryGridClick/);
  assert.match(page, /isCatalogSubcategoryPickerActive/);
  assert.match(hook, /fetchCategoryChildren/);
  assert.match(hook, /categoryId/);
  assert.match(hook, /openPickerForCategory/);
  assert.match(page, /EditCategoryNodeDisplayModal/);
  assert.match(page, /editingCategoryNode/);
  assert.match(picker, /onEditCategoryPress/);
  assert.match(picker, /isAdmin/);
  assert.match(picker, /SUBCATEGORY_NODE_EDIT_ARIA/);
  assert.match(tiles, /SUBCATEGORY_VIEW_ALL/);
  assert.match(tiles, /isEditable: true/);
});

test("home catalog consumes categoryId from pending filters", () => {
  const index = readMobileFile("app/(tabs)/index.tsx");

  assert.match(index, /pending\.categoryId/);
  assert.match(index, /selectedSubcategoryId/);
});
