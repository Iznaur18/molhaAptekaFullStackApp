import { CATALOG_SEARCH_MODE_ATLAS } from "../../constants/productAtlasSearchConstants.js";

import { isAtlasSearchUnavailableError } from "./isAtlasSearchUnavailableError.js";
import {
  countCatalogProductsAtlas,
  findCatalogProductsPageAtlas,
} from "./productCatalogAtlasSearch.js";
import { countProducts, findProductsPage } from "./productCatalogQuery.js";

/**
 * @param {import('./buildProductCatalogSearchQuery.js').ProductCatalogSearchResult} searchResult
 */
const regexSearchRankFromIntent = (searchResult) => {
  if (!searchResult.intent?.hasTextSearch) {
    return null;
  }

  return {
    escapedRegexPattern: searchResult.intent.escapedRegexPattern,
    categorySlugs: searchResult.intent.categorySlugs,
  };
};

/**
 * @param {import('./buildProductCatalogSearchQuery.js').ProductCatalogSearchResult} searchResult
 * @param {string} sort
 * @param {number} skip
 * @param {number} limit
 * @param {string | null} [buyerCity]
 */
export const findCatalogProductsPage = async (
  searchResult,
  sort,
  skip,
  limit,
  buyerCity = null,
) => {
  if (searchResult.mode === CATALOG_SEARCH_MODE_ATLAS && searchResult.atlasSearch) {
    try {
      return await findCatalogProductsPageAtlas(searchResult, sort, skip, limit, buyerCity);
    } catch (error) {
      if (!isAtlasSearchUnavailableError(error)) {
        throw error;
      }
      console.warn(
        "[catalog-search] Atlas $search unavailable, falling back to regex:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return findProductsPage(
    searchResult.query,
    sort,
    skip,
    limit,
    searchResult.searchRank ?? regexSearchRankFromIntent(searchResult),
    buyerCity,
  );
};

/**
 * @param {import('./buildProductCatalogSearchQuery.js').ProductCatalogSearchResult} searchResult
 */
export const countCatalogProducts = async (searchResult) => {
  if (searchResult.mode === CATALOG_SEARCH_MODE_ATLAS && searchResult.atlasSearch) {
    try {
      return await countCatalogProductsAtlas(searchResult);
    } catch (error) {
      if (!isAtlasSearchUnavailableError(error)) {
        throw error;
      }
      console.warn(
        "[catalog-search] Atlas count unavailable, falling back to regex:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return countProducts(searchResult.query);
};
