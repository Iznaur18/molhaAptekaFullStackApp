const CATALOG_PRODUCTS_CACHE_TTL_MS = 20_000;
const CATALOG_PRODUCTS_CACHE_MAX_ENTRIES = 200;

/** @type {Map<string, { expiresAt: number; value: unknown }>} */
const catalogProductsCache = new Map();

/**
 * @param {Record<string, unknown>} query
 */
const stableSerializeQuery = (query) => {
  const keys = Object.keys(query).sort();
  /** @type {Record<string, unknown>} */
  const normalized = {};
  for (const key of keys) {
    const value = query[key];
    if (value === undefined || value === "") {
      continue;
    }
    normalized[key] = value;
  }
  return JSON.stringify(normalized);
};

/**
 * @param {{
 *   userId?: string;
 *   query: Record<string, unknown>;
 *   nearPoint?: string | null;
 * }} input
 */
export const buildCatalogProductsCacheKey = ({ userId, query, nearPoint = null }) => {
  const nearPart = nearPoint ? `near@${nearPoint}:` : "";
  return `${userId ?? "anon"}:${nearPart}${stableSerializeQuery(query)}`;
};

/**
 * @param {string} key
 */
export const getCachedCatalogProducts = (key) => {
  const entry = catalogProductsCache.get(key);
  if (!entry) {
    return null;
  }
  if (entry.expiresAt <= Date.now()) {
    catalogProductsCache.delete(key);
    return null;
  }
  return entry.value;
};

/**
 * @param {string} key
 * @param {unknown} value
 */
export const setCachedCatalogProducts = (key, value) => {
  if (catalogProductsCache.size >= CATALOG_PRODUCTS_CACHE_MAX_ENTRIES) {
    const oldestKey = catalogProductsCache.keys().next().value;
    if (oldestKey) {
      catalogProductsCache.delete(oldestKey);
    }
  }
  catalogProductsCache.set(key, {
    value,
    expiresAt: Date.now() + CATALOG_PRODUCTS_CACHE_TTL_MS,
  });
};

export const invalidateCatalogProductsCache = () => {
  catalogProductsCache.clear();
};
