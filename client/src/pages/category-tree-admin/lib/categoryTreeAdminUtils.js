export const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * @param {string} slug
 */
export const isValidCategorySlug = (slug) => CATEGORY_SLUG_PATTERN.test(slug);

/**
 * @param {import('../../../entities/product-category-tree/model/adminTypes.js').ProductCategoryAdminRow} row
 */
export const formatCategoryPath = (row) => {
  const path = Array.isArray(row.pathLabelRu) ? row.pathLabelRu.filter(Boolean) : [];
  if (path.length > 0) {
    return path.join(" › ");
  }
  return row.labelRu ?? "";
};

/**
 * @param {string} raw
 */
export const parseKeywordsCsv = (raw) =>
  raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

/**
 * @param {import('../../../entities/product-category-tree/model/adminTypes.js').ProductCategoryAdminRow[]} rows
 */
export const sortCategoryRows = (rows) =>
  [...rows].sort((a, b) => a.pathSlugs.join("/").localeCompare(b.pathSlugs.join("/")));

/**
 * @param {string} query
 * @param {import('../../../entities/product-category-tree/model/adminTypes.js').ProductCategoryAdminRow[]} rows
 */
export const filterCategoryRows = (rows, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) => {
    const haystack = [
      row.slug,
      row.labelRu,
      formatCategoryPath(row),
      ...(row.searchKeywords ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
};

/**
 * @param {import('../../../entities/product-category-tree/model/adminTypes.js').ProductCategoryAdminRow} row
 * @param {Record<string, string | boolean>} draft
 */
export const isCategoryStructureChanged = (row, draft) =>
  String(draft.slug ?? "") !== row.slug ||
  String(draft.labelRu ?? "") !== row.labelRu ||
  String(draft.parentId ?? "") !== String(row.parentId ?? "");

/**
 * @param {import('../../../entities/product-category-tree/model/adminTypes.js').ProductCategoryAdminRow} row
 * @param {import('../../../entities/product-category-tree/model/adminTypes.js').ProductCategoryAdminRow[]} rows
 */
const sortLeafRows = (items) =>
  [...items].sort(
    (a, b) =>
      (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) ||
      String(a.labelRu ?? "").localeCompare(String(b.labelRu ?? ""), "ru"),
  );

/**
 * @param {import('../../../entities/product-category-tree/model/adminTypes.js').ProductCategoryAdminRow} row
 * @param {import('../../../entities/product-category-tree/model/adminTypes.js').ProductCategoryAdminRow[]} rows
 */
export const findSiblingLeafForReassign = (row, rows) => {
  if (!row.parentId || row.isLeaf !== true) {
    return null;
  }

  const siblings = rows.filter(
    (item) =>
      item._id !== row._id &&
      item.parentId === row.parentId &&
      item.isLeaf === true,
  );
  if (siblings.length === 0) {
    return null;
  }

  return sortLeafRows(siblings)[0];
};

/**
 * @param {import('../../../entities/product-category-tree/model/adminTypes.js').ProductCategoryAdminRow} row
 * @param {import('../../../entities/product-category-tree/model/adminTypes.js').ProductCategoryAdminRow[]} rows
 */
export const findAnyLeafForReassign = (row, rows) => {
  if (row.isLeaf !== true) {
    return null;
  }

  const sibling = findSiblingLeafForReassign(row, rows);
  if (sibling) {
    return sibling;
  }

  const otherLeaves = rows.filter(
    (item) => item._id !== row._id && item.isLeaf === true,
  );
  return otherLeaves.length > 0 ? sortLeafRows(otherLeaves)[0] : null;
};

/**
 * @param {import('../../../entities/product-category-tree/model/adminTypes.js').ProductCategoryAdminRow} row
 */
export const formatCategoryLegacyDetachLabel = (row) => {
  const path = Array.isArray(row.pathLabelRu) ? row.pathLabelRu.filter(Boolean) : [];
  return path[0] ?? row.labelRu ?? "корневую категорию";
};
