/** @typedef {'catalog' | 'catalog-browser'} CatalogMainView */

/** @type {Record<CatalogMainView, string>} */
export const CATALOG_MAIN_VIEW_PATH = {
  catalog: "/",
  "catalog-browser": "/catalog",
};

/** @type {Map<string, CatalogMainView>} */
const PATH_TO_CATALOG_VIEW = new Map(
  Object.entries(CATALOG_MAIN_VIEW_PATH).map(([view, path]) => [
    normalizePathname(path),
    /** @type {CatalogMainView} */ (view),
  ]),
);

/**
 * @param {string} pathname
 * @returns {string}
 */
function normalizePathname(pathname) {
  if (!pathname || pathname === "/") {
    return "/";
  }
  return pathname.replace(/\/+$/, "");
}

/**
 * @param {string} pathname
 * @returns {CatalogMainView | null}
 */
export function pathnameToCatalogMainView(pathname) {
  return PATH_TO_CATALOG_VIEW.get(normalizePathname(pathname)) ?? null;
}

/**
 * @param {CatalogMainView} view
 * @returns {string}
 */
export function catalogMainViewToPathname(view) {
  return CATALOG_MAIN_VIEW_PATH[view] ?? "/";
}

/** Пути ленты каталога (не «Мои товары»). */
export function isCatalogMainViewPath(pathname) {
  return pathnameToCatalogMainView(pathname) != null;
}
