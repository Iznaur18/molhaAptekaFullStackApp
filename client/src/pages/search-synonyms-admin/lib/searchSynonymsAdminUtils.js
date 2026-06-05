import { PRODUCT_CATEGORIES } from "../../../entities/product/model/productConstants.js";

/**
 * @param {string} raw
 */
export const parseSynonymCategories = (raw) =>
  raw
    .split(",")
    .map((item) => item.trim())
    .filter((slug) => PRODUCT_CATEGORIES.includes(slug));

/**
 * @param {string[]} categories
 */
export const formatSynonymCategoriesCsv = (categories) => categories.join(", ");

/**
 * @param {string} query
 * @param {import('../../../entities/product-search-synonym/model/types.js').ProductSearchSynonymRow[]} rows
 */
export const filterSynonymRows = (rows, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) => {
    const token = row.token.toLowerCase();
    const cats = row.categories.join(" ").toLowerCase();
    return token.includes(q) || cats.includes(q);
  });
};

/**
 * @param {import('../../../entities/product-search-synonym/model/types.js').ProductSearchSynonymRow[]} rows
 */
export const sortSynonymRows = (rows) =>
  [...rows].sort((a, b) => a.token.localeCompare(b.token, "ru"));
