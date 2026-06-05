/** Имя Search Index в Atlas (см. server/atlas-search/product-catalog.index.json). */
export const PRODUCT_ATLAS_SEARCH_INDEX_NAME = "product_catalog";

/** Boost productName относительно productSearchBlob в compound $search. */
export const PRODUCT_ATLAS_SEARCH_NAME_BOOST = 3;

export const CATALOG_SEARCH_MODE_ATLAS = "atlas";
export const CATALOG_SEARCH_MODE_REGEX = "regex";
export const CATALOG_SEARCH_MODE_NONE = "none";
