/**
 * @param {import('mongoose').LeanDocument<import('../models/ProductCategoryModel.js').default> | Record<string, unknown>} row
 */
export const toProductCategoryPublicPayload = (row) => ({
  id: String(row._id),
  slug: String(row.slug ?? ""),
  labelRu: String(row.labelRu ?? ""),
  parentId: row.parentId ? String(row.parentId) : null,
  depth: Number(row.depth) || 0,
  pathSlugs: Array.isArray(row.pathSlugs) ? row.pathSlugs.map(String) : [],
  pathLabelRu: Array.isArray(row.pathLabelRu) ? row.pathLabelRu.map(String) : [],
  isLeaf: row.isLeaf === true,
  legacyProductCategory:
    typeof row.legacyProductCategory === "string" ? row.legacyProductCategory : null,
  searchKeywords: Array.isArray(row.searchKeywords)
    ? row.searchKeywords.map(String)
    : [],
  defaultCharacteristicKeys: Array.isArray(row.defaultCharacteristicKeys)
    ? row.defaultCharacteristicKeys.map(String)
    : [],
});

/**
 * @param {import('mongoose').LeanDocument<import('../models/ProductCategoryModel.js').default> | Record<string, unknown>} row
 */
export const toProductCategoryBreadcrumbPayload = (row) => {
  const pathSlugs = Array.isArray(row.pathSlugs) ? row.pathSlugs.map(String) : [];
  const pathLabelRu = Array.isArray(row.pathLabelRu) ? row.pathLabelRu.map(String) : [];

  return {
    categoryId: String(row._id),
    slug: String(row.slug ?? ""),
    labelRu: String(row.labelRu ?? ""),
    items: pathSlugs.map((slug, index) => ({
      slug,
      labelRu: pathLabelRu[index] ?? slug,
    })),
  };
};
