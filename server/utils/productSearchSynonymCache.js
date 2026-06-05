import ProductSearchSynonymModel from "../models/ProductSearchSynonymModel.js";

/** @type {Record<string, { categories: string[] }> | null} */
let cachedTokensMap = null;

/**
 * @param {import('mongoose').LeanDocument<import('../models/ProductSearchSynonymModel.js').default>[]} rows
 */
const rowsToTokensMap = (rows) => {
  /** @type {Record<string, { categories: string[] }>} */
  const map = {};
  for (const row of rows) {
    const token = String(row?.token ?? "").trim();
    if (!token) continue;
    const categories = Array.isArray(row.categories)
      ? row.categories.filter(Boolean)
      : [];
    if (!categories.length) continue;
    map[token] = { categories };
  }
  return map;
};

export const invalidateProductSearchSynonymCache = () => {
  cachedTokensMap = null;
};

/**
 * @returns {Promise<Record<string, { categories: string[] }>>}
 */
export const getProductSearchSynonymTokensMap = async () => {
  if (cachedTokensMap) {
    return cachedTokensMap;
  }
  const rows = await ProductSearchSynonymModel.find().lean();
  cachedTokensMap = rowsToTokensMap(rows);
  return cachedTokensMap;
};
