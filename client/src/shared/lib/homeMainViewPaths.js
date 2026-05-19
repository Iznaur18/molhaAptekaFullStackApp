/**
 * Пути экранов главной SPA. Не использовать `/cart` и `/users`: в dev Vite
 * проксирует `/cart` и `/user` на Express (см. vite.config.js); `/users` на
 * :4444 даёт 404 JSON вместо SPA.
 *
 * @typedef {'catalog' | 'users' | 'cart' | 'my-sales' | 'my-orders' | 'admin-orders'} HomeMainView
 */

/** @type {Record<HomeMainView, string>} */
export const HOME_MAIN_VIEW_PATH = {
  catalog: "/",
  /** Список пользователей; не `/users` — путается с API и при F5 на :4444. */
  users: "/user-list",
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

/** Старые закладки; на Express :4444 по-прежнему 404. */
const LEGACY_PATH_TO_VIEW = new Map([["/users", "users"]]);

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
  const normalized = normalizePathname(pathname);
  return (
    PATH_TO_VIEW.get(normalized) ??
    LEGACY_PATH_TO_VIEW.get(normalized) ??
    null
  );
}

/**
 * @param {HomeMainView} view
 * @returns {string}
 */
export function mainViewToPathname(view) {
  return HOME_MAIN_VIEW_PATH[view] ?? "/";
}
