import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const readMobileFile = (relativePath) =>
  readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("category tree admin page mirrors web admin panel shell", () => {
  const page = readMobileFile("features/category-tree-admin-page/ui/CategoryTreeAdminPage.tsx");
  const hook = readMobileFile("features/category-tree-admin-page/model/useCategoryTreeAdminPage.ts");

  assert.match(page, /ProfileMobileSectionToggle/);
  assert.match(page, /ProfileMobileNavSheet/);
  assert.match(page, /AdminPanelShell/);
  assert.match(page, /CategoryTreeAdminCard/);
  assert.match(page, /contentPaddingBottom/);
  assert.match(page, /activeSectionId="category-tree-admin"/);
  assert.match(page, /TAB_CATEGORY_TREE_ADMIN/);
  assert.doesNotMatch(page, /staffAdminStyles/);
  assert.doesNotMatch(page, /ADD_CREATE/);

  assert.match(hook, /updateRows/);
  assert.match(hook, /categoryAdminQueryKeys/);
  assert.match(hook, /isCategoryStructureChanged/);
});

test("category tree admin card mirrors web tree indent and badges", () => {
  const card = readMobileFile("features/category-tree-admin-page/ui/CategoryTreeAdminCard.tsx");

  assert.match(card, /resolveCategoryTreeCardIndent/);
  assert.match(card, /LEAF_BADGE/);
  assert.match(card, /BRANCH_BADGE/);
  assert.match(card, /CategoryTreeParentPicker/);
  assert.match(card, /CategoryTreeLegacyPicker/);
  assert.match(card, /keywords\.join/);
});

test("category tree admin ui copy matches web page", () => {
  const copy = readMobileFile("shared/config/appUiCopy.ts");

  assert.match(copy, /TITLE: "Дерево категорий"/);
  assert.match(copy, /DELETE_CONFIRM: "Удалить категорию\? Должны отсутствовать дочерние узлы и товары\."/);
  assert.match(copy, /LABEL_KEYWORDS: "Ключевые слова поиска"/);
});
