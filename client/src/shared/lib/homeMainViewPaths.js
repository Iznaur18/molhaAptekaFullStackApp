import { isStaffStandaloneMainView } from "./staffMainViews.js";

/**
 * Пути экранов главной SPA. Не использовать `/cart`: в dev Vite проксирует
 * `/cart` на Express. `/user/:mongoId` — SPA-профиль (Accept: text/html) и
 * API (XHR); `/user-list` ок для списка пользователей.
 *
 * @typedef {'catalog' | 'catalog-browser' | 'my-profile' | 'my-products' | 'users' | 'subscriptions' | 'wishlist' | 'notifications' | 'cart' | 'my-sales' | 'my-orders' | 'auction' | 'data-confirmation' | 'premium' | 'loyalty-points' | 'partner-program' | 'advertising' | 'onec-integration' | 'edit-profile' | 'admin-orders' | 'admin-analytics' | 'staff-audit-log-admin' | 'broadcast-notifications-admin' | 'search-synonyms-admin' | 'category-tree-admin' | 'app-intro-admin' | 'site-header-banner-admin' | 'product-manage-toggle-display-admin' | 'popular-products-admin' | 'product-moderation' | 'intro-ad-moderation' | 'seller-personal-category-moderation' | 'product-reports' | 'staff-raffles' | 'data-confirmation-requests' | 'courier' | 'courier-moderation' | 'courier-overview' | 'installment-payments' | 'installment-sales' | 'installment-disputes' | 'shipment-disputes' | 'shipping-carriers'} HomeMainView
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
  wishlist: "/wishlist",
  notifications: "/notifications",
  /** UI корзины; не `/cart` из‑за proxy в Vite. */
  cart: "/basket",
  "my-sales": "/my-sales",
  "my-orders": "/my-orders",
  auction: "/auction",
  "data-confirmation": "/data-confirmation",
  premium: "/premium",
  "loyalty-points": "/loyalty-points",
  "partner-program": "/partner-program",
  advertising: "/profile/advertising",
  "onec-integration": "/profile/onec-integration",
  "edit-profile": "/profile/edit-profile",
  "admin-orders": "/admin-orders",
  "admin-analytics": "/admin-analytics",
  "staff-audit-log-admin": "/staff-audit-log-admin",
  "broadcast-notifications-admin": "/broadcast-notifications-admin",
  "search-synonyms-admin": "/search-synonyms-admin",
  "category-tree-admin": "/category-tree-admin",
  "app-intro-admin": "/app-intro-admin",
  "site-header-banner-admin": "/site-header-banner-admin",
  "popular-products-admin": "/profile/popular-products-admin",
  "product-moderation": "/moderation-products",
  "intro-ad-moderation": "/moderation-intro-ad",
  "seller-personal-category-moderation": "/moderation-seller-categories",
  "product-reports": "/product-reports",
  "staff-raffles": "/staff-raffles",
  "data-confirmation-requests": "/data-confirmation-requests",
  courier: "/become-courier",
  "courier-moderation": "/courier-moderation",
  "shipment-disputes": "/shipment-disputes",
  "shipping-carriers": "/shipping-carriers",
  "courier-overview": "/courier-overview",
  "installment-payments": "/installment-payments",
  "installment-sales": "/installment-sales",
  "installment-disputes": "/installment-disputes",
};

/** @type {Map<string, HomeMainView>} */
const PATH_TO_VIEW = new Map(
  Object.entries(HOME_MAIN_VIEW_PATH).map(([view, path]) => [
    normalizePathname(path),
    /** @type {HomeMainView} */ (view),
  ]),
);

/** Старые закладки; на Express :4444 по-прежнему 404. */
const LEGACY_PATH_TO_VIEW = new Map([
  ["/users", "users"],
  ["/product-manage-toggle-display-admin", "site-header-banner-admin"],
  ["/affiliate-listings", "partner-program"],
]);

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
  return PATH_TO_VIEW.get(normalized) ?? LEGACY_PATH_TO_VIEW.get(normalized) ?? null;
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

/** Staff/admin URL (guard в AccountMainContent). */
export function isRoleRestrictedMainView(view) {
  return isStaffStandaloneMainView(view);
}
