import {
  CATALOG_SEARCH_MODE_ATLAS,
  CATALOG_SEARCH_MODE_NONE,
  CATALOG_SEARCH_MODE_REGEX,
} from "../../constants/productAtlasSearchConstants.js";
import { findProductCategoryIdsForSearchIntent } from "./mergeProductCatalogCategoryFilter.js";
import { resolveProductSearchIntent } from "./resolveProductSearchIntent.js";

/**
 * @typedef {Object} ProductCatalogAtlasSearchPayload
 * @property {string} normalizedTerm
 * @property {string[]} categorySlugs
 * @property {string[]} categoryNodeIds
 */

/**
 * @typedef {Object} ProductCatalogSearchResult
 * @property {typeof CATALOG_SEARCH_MODE_NONE | typeof CATALOG_SEARCH_MODE_REGEX | typeof CATALOG_SEARCH_MODE_ATLAS} mode
 * @property {Record<string, unknown>} query
 * @property {Record<string, unknown>} baseQuery
 * @property {Awaited<ReturnType<typeof resolveProductSearchIntent>>} intent
 * @property {{ escapedRegexPattern: string; categorySlugs: string[] } | null} searchRank
 * @property {ProductCatalogAtlasSearchPayload | null} atlasSearch
 */

/**
 * @param {unknown} rawSearch
 * @param {Record<string, unknown>} baseQuery
 * @param {{ preferAtlas?: boolean }} [options]
 * @returns {Promise<ProductCatalogSearchResult>}
 */
export const buildProductCatalogSearchQuery = async (
  rawSearch,
  baseQuery = {},
  options = {},
) => {
  const { preferAtlas = false } = options;
  const intent = await resolveProductSearchIntent(rawSearch);

  if (!intent.hasTextSearch) {
    return {
      mode: CATALOG_SEARCH_MODE_NONE,
      query: baseQuery,
      baseQuery,
      intent,
      searchRank: null,
      atlasSearch: null,
    };
  }

  const categoryNodeIds = await findProductCategoryIdsForSearchIntent(intent);

  /** @type {Record<string, unknown>[]} */
  const orClauses = [
    { productName: intent.regexCondition },
    { productSearchBlob: intent.regexCondition },
  ];

  if (intent.categorySlugs.length > 0) {
    orClauses.push({ productCategory: { $in: intent.categorySlugs } });
  }

  if (categoryNodeIds.length > 0) {
    orClauses.push({ productCategoryId: { $in: categoryNodeIds } });
  }

  const query = {
    $and: [baseQuery, { $or: orClauses }],
  };

  const atlasSearch = {
    normalizedTerm: intent.normalizedTerm,
    categorySlugs: intent.categorySlugs,
    categoryNodeIds,
  };

  if (preferAtlas) {
    return {
      mode: CATALOG_SEARCH_MODE_ATLAS,
      query,
      baseQuery,
      intent,
      searchRank: null,
      atlasSearch,
    };
  }

  return {
    mode: CATALOG_SEARCH_MODE_REGEX,
    query,
    baseQuery,
    intent,
    searchRank: {
      escapedRegexPattern: intent.escapedRegexPattern,
      categorySlugs: intent.categorySlugs,
    },
    atlasSearch: null,
  };
};
