import { CATALOG_SEARCH_MODE_ATLAS } from "../../constants/productAtlasSearchConstants.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

import { isAtlasSearchUnavailableError } from "./isAtlasSearchUnavailableError.js";
import {
  countCatalogProductsAtlas,
  findCatalogProductsPageAtlas,
} from "./productCatalogAtlasSearch.js";
import {
  countProductsNear,
  findProductsPageNear,
} from "./productCatalogNearQuery.js";
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
 * @param {{ lat: number; lon: number; maxDistanceMeters: number } | null} [near]
 */
export const findCatalogProductsPage = async (
  searchResult,
  sort,
  skip,
  limit,
  buyerCity = null,
  viewerRegionCode = null,
  near = null,
) => {
  const searchRank =
    searchResult.searchRank ?? regexSearchRankFromIntent(searchResult);

  if (near) {
    return findProductsPageNear({
      productsQuery: searchResult.query,
      sort,
      skip,
      limit,
      searchRank,
      viewerRegionCode,
      near,
    });
  }

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
    searchRank,
    buyerCity,
    viewerRegionCode,
  );
};

/**
 * @param {import('./buildProductCatalogSearchQuery.js').ProductCatalogSearchResult} searchResult
 * @param {{ lat: number; lon: number; maxDistanceMeters: number } | null} [near]
 * @param {string | null} [viewerRegionCode]
 */
export const countCatalogProducts = async (
  searchResult,
  near = null,
  viewerRegionCode = null,
) => {
  if (near) {
    return countProductsNear({
      productsQuery: searchResult.query,
      near,
      viewerRegionCode,
    });
  }

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
