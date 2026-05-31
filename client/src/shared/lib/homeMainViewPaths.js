/**
 * Пути экранов главной SPA. Не использовать `/cart` и `/users`: в dev Vite
 * проксирует `/cart` и `/user/...` на Express (см. vite.config.js).
 * Путь `/user-list` ок: не совпадает с API `/user` (иначе F5 → 404 JSON).
 *
 * @typedef {'catalog' | 'catalog-browser' | 'my-profile' | 'my-products' | 'users' | 'subscriptions' | 'notifications' | 'cart' | 'my-sales' | 'my-orders' | 'admin-orders' | 'product-moderation' | 'product-reports' | 'data-confirmation-requests'} HomeMainView
 */

/** @type {Record<HomeMainView, string>} */
export const HOME_MAIN_VIEW_PATH = {
  catalog: "/",
  "catalog-browser": "/catalog",
  "my-profile": "/me",
  "my-products": "/my-products",
  /** Список пользователей; не `/users` — путается с API и при F5 на :4444. */
  users: "/user-list",
  subscriptions: "/subscriptions",
  notifications: "/notifications",
  /** UI корзины; не `/cart` из‑за proxy в Vite. */
  cart: "/basket",
  "my-sales": "/my-sales",
  "my-orders": "/my-orders",
  "admin-orders": "/admin-orders",
  "product-moderation": "/moderation-products",
  "product-reports": "/product-reports",
  "data-confirmation-requests": "/data-confirmation-requests",
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

/**
 * @param {HomeMainView} view
 */
export function isMyProductsMainView(view) {
  return view === "my-products";
}

/**
 * @param {HomeMainView} view
 */
export function isCatalogBrowserMainView(view) {
  return view === "catalog-browser";
}

/**
 * Каталог и «Мои товары» — одна оболочка (поиск, сетка, подгрузка).
 *
 * @param {HomeMainView} view
 */
export function isCatalogShellMainView(view) {
  return view === "catalog" || view === "my-products";
}

/**
 * Шапка с поиском и фильтрами каталога.
 *
 * @param {HomeMainView} view
 */
export function isCatalogHeaderMainView(view) {
  return isCatalogShellMainView(view) || isCatalogBrowserMainView(view);
}

/** Экраны, для которых нужна загруженная роль (admin / moderator). */
export function isRoleRestrictedMainView(view) {
  return (
    view === "admin-orders" ||
    view === "product-moderation" ||
    view === "product-reports" ||
    view === "data-confirmation-requests"
  );
}
