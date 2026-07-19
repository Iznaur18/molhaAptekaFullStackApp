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
  assert.match(
    copy,
    /DELETE_CONFIRM:\s*"Удалить категорию вместе со всеми подкатегориями\? В ветке не должно быть товаров\."/,
  );
  assert.match(copy, /LABEL_KEYWORDS: "Ключевые слова поиска"/);
});

test("category tree admin delete is cascade without reassign prompts", () => {
  const page = readMobileFile("features/category-tree-admin-page/ui/CategoryTreeAdminPage.tsx");
  const hook = readMobileFile("features/category-tree-admin-page/model/useCategoryTreeAdminPage.ts");
  const utils = readMobileFile("features/category-tree-admin-page/lib/categoryTreeAdminUtils.ts");

  assert.match(hook, /collectCategorySubtreeIdsFromRows/);
  assert.match(hook, /removeCategorySubtree/);
  assert.match(hook, /invalidateCatalogCategorySurfaces/);
  assert.match(utils, /export const collectCategorySubtreeIdsFromRows/);
  assert.doesNotMatch(page, /DELETE_REASSIGN_CONFIRM/);
  assert.doesNotMatch(page, /DELETE_DETACH_CONFIRM/);
});

test("collectCategorySubtreeIdsFromRows walks parent links", () => {
  const collectCategorySubtreeIdsFromRows = (rootId, rows) => {
    const ids = new Set([String(rootId)]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const row of rows) {
        const id = String(row._id);
        const parentId = row.parentId ? String(row.parentId) : "";
        if (parentId && ids.has(parentId) && !ids.has(id)) {
          ids.add(id);
          grew = true;
        }
      }
    }
    return ids;
  };

  const rows = [
    { _id: "root", parentId: null },
    { _id: "child", parentId: "root" },
    { _id: "grand", parentId: "child" },
    { _id: "other", parentId: null },
  ];

  const ids = collectCategorySubtreeIdsFromRows("root", rows);
  assert.deepEqual([...ids].sort(), ["child", "grand", "root"]);
});
