import { CATALOG_SEARCH_MODE_ATLAS } from "../../constants/productAtlasSearchConstants.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

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
 * @param {string | null} [viewerRegionCode]
 */
export const findCatalogProductsPage = async (
  searchResult,
  sort,
  skip,
  limit,
  buyerCity = null,
  viewerRegionCode = null,
) => {
  if (searchResult.mode === CATALOG_SEARCH_MODE_ATLAS && searchResult.atlasSearch) {
    try {
      return await findCatalogProductsPageAtlas(
        searchResult,
        sort,
        skip,
        limit,
        buyerCity,
        viewerRegionCode,
      );
    } catch (error) {
      if (!isAtlasSearchUnavailableError(error)) {
        throw error;
      }
      logServerEvent("warn", {
        event: "catalog_search_atlas_unavailable_fallback_regex",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return findProductsPage(
    searchResult.query,
    sort,
    skip,
    limit,
    searchResult.searchRank ?? regexSearchRankFromIntent(searchResult),
    buyerCity,
    viewerRegionCode,
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
      logServerEvent("warn", {
        event: "catalog_count_atlas_unavailable_fallback_regex",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return countProducts(searchResult.query);
};
