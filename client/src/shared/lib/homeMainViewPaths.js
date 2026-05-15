/**
 * Пути экранов главной SPA. Не использовать `/cart`: в dev Vite проксирует
 * `/cart` на Express (см. vite.config.js).
 *
 * @typedef {'catalog' | 'users' | 'cart' | 'my-sales' | 'my-orders' | 'admin-orders'} HomeMainView
 */

/** @type {Record<HomeMainView, string>} */
export const HOME_MAIN_VIEW_PATH = {
  catalog: "/",
  users: "/users",
  /** UI корзины; не `/cart` из‑за proxy в Vite. */
  cart: "/basket",
  "my-sales": "/my-sales",
  "my-orders": "/my-orders",
  "admin-orders": "/admin-orders",
};

/** @type {Map<string, HomeMainView>} */
const PATH_TO_VIEW = new Map(
  Object.entries(HOME_MAIN_VIEW_PATH).map(([view, path]) => [
    normalizePathname(path),
    /** @type {HomeMainView} */ (view),
  ]),
);

/**
 * @param {string} pathname
 * @returns {string}
 */
function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

/**
 * @param {string} pathname
 * @returns {HomeMainView | null}
 */
export function pathnameToMainView(pathname) {
  return PATH_TO_VIEW.get(normalizePathname(pathname)) ?? null;
}

/**
 * @param {HomeMainView} view
 * @returns {string}
 */
export function mainViewToPathname(view) {
  return HOME_MAIN_VIEW_PATH[view] ?? "/";
}
