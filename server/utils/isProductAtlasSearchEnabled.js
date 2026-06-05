import {
  CATALOG_SEARCH_MODE_ATLAS,
  CATALOG_SEARCH_MODE_REGEX,
} from "../constants/productAtlasSearchConstants.js";

/**
 * @returns {boolean}
 */
export const isProductAtlasSearchEnabled = () => {
  const raw = process.env.ATLAS_SEARCH_ENABLED;
  if (raw == null || String(raw).trim() === "") {
    return false;
  }
  return String(raw).trim().toLowerCase() === "true";
};

/**
 * Режим для /health (конфиг, не runtime fallback).
 *
 * @returns {typeof CATALOG_SEARCH_MODE_ATLAS | typeof CATALOG_SEARCH_MODE_REGEX}
 */
export const getConfiguredCatalogSearchMode = () =>
  isProductAtlasSearchEnabled() ? CATALOG_SEARCH_MODE_ATLAS : CATALOG_SEARCH_MODE_REGEX;
