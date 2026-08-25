/**
 * Единая таблица «путь сайта → маршрут приложения».
 *
 * Раньше таблиц было две: полная — для кликов по баннеру шапки
 * (`resolveSiteHeaderBannerMobileRoute`) и урезанная на 11 путей — для
 * входящих deep link'ов (`parseAppDeepLink`). Из-за этого универсальная ссылка
 * на `/basket`, `/wishlist`, `/me`, `/faq`, `/legal/*` открывала приложение и
 * молча оставляла человека на главной. Теперь оба входа читают этот модуль.
 *
 * Источник правды по путям сайта — `client/src/shared/lib/homeMainViewPaths.js`
 * (`HOME_MAIN_VIEW_PATH` + `LEGACY_PATH_TO_VIEW`) и `client/src/app/routes/appRoutes.jsx`.
 *
 * Модуль намеренно без alias-импортов: так его можно импортировать напрямую в
 * `node --test` (см. scripts/deep-link-routes.test.mjs).
 */

export const HOME_ROUTE = "/(tabs)";

/** Разделы, которых на мобилке нет: пусть лучше вернётся null, чем заглушка. */
const WEB_ONLY_PATHS = new Set([
  "/profile/onec-integration",
  "/staff-audit-log-admin",
  "/broadcast-notifications-admin",
  "/admin-analytics",
]);

/** Точные пути сайта. Ключи в нижнем регистре. */
const STATIC_PATH_ROUTES: Record<string, string> = {
  "/": HOME_ROUTE,

  // Каталог и корзина
  "/catalog": "/catalog-browser",
  "/catalog-browser": "/catalog-browser",
  "/basket": "/(tabs)/cart",
  "/cart": "/(tabs)/cart",

  // Профиль
  "/me": "/(tabs)/profile",
  "/my-profile": "/(tabs)/profile",
  "/profile/edit-profile": "/profile/edit",

  // Торговля
  "/my-products": "/hub/my-products",
  "/my-sales": "/hub/my-sales",
  "/my-orders": "/hub/my-orders",
  "/orders": "/orders",
  "/auction": "/hub/auction",
  "/installment-payments": "/hub/installment-payments",
  "/installment-sales": "/hub/installment-sales",

  // Аккаунт
  "/subscriptions": "/hub/subscriptions",
  "/wishlist": "/hub/wishlist",
  "/notifications": "/notifications",
  "/data-confirmation": "/hub/data-confirmation",
  "/premium": "/hub/premium",
  "/loyalty-points": "/hub/loyalty-points",
  "/partner-program": "/hub/partner-program",
  "/affiliate-listings": "/hub/partner-program",
  "/advertising": "/hub/advertising",
  "/profile/advertising": "/hub/advertising",

  // Пользователи
  "/users": "/users",
  "/user-list": "/users",

  // Статика
  "/faq": "/faq",
  "/legal": "/legal/terms",

  // Авторизация
  "/login": "/(auth)/login",
  "/register": "/(auth)/register",
  "/forgot-password": "/(auth)/forgot-password",

  // Стафф и модерация
  "/moderation-products": "/hub/product-moderation",
  "/moderation-intro-ad": "/hub/intro-ad-moderation",
  "/moderation-seller-categories": "/hub/seller-personal-category-moderation",
  "/product-reports": "/hub/product-reports",
  /** В вебе `/product-promotions` — редирект на `/moderation-products`. */
  "/product-promotions": "/hub/product-moderation",
  "/staff-raffles": "/hub/intro-ad-moderation",
  "/data-confirmation-requests": "/hub/data-confirmation-requests",
  "/installment-disputes": "/hub/installment-disputes",
  "/admin-orders": "/hub/admin-orders",
  "/search-synonyms-admin": "/hub/search-synonyms-admin",
  "/category-tree-admin": "/hub/category-tree-admin",
  "/app-intro-admin": "/hub/app-intro-admin",
  "/site-header-banner-admin": "/hub/site-header-banner-admin",
  /** Легаси-путь, в вебе редиректится сюда же. */
  "/product-manage-toggle-display-admin": "/hub/site-header-banner-admin",
  "/profile/popular-products-admin": "/hub/popular-products-admin",
};

/** `/user/search` и `/user/me` — не профили, а служебные пути веба. */
const RESERVED_USER_PATH_SEGMENTS = new Set([
  "search",
  "me",
  "data-confirmation-requests",
]);

const LEGAL_KINDS = new Set(["terms", "privacy", "listing", "offer"]);

const DYNAMIC_SEGMENT_ROUTES: { pattern: RegExp; build: (id: string) => string }[] = [
  { pattern: /^\/product\/([^/?#]+)$/i, build: (id) => `/product/${id}` },
  { pattern: /^\/raffle\/([^/?#]+)$/i, build: (id) => `/raffle/${id}` },
  { pattern: /^\/seller\/([^/?#]+)$/i, build: (id) => `/seller/${id}` },
  { pattern: /^\/hub\/([^/?#]+)$/i, build: (id) => `/hub/${id}` },
];

export const normalizeWebPath = (rawPath: string): string => {
  const withoutQuery = rawPath.split("?")[0]?.split("#")[0] ?? rawPath;
  const trimmed = withoutQuery.trim();
  if (!trimmed || trimmed === "/") {
    return "/";
  }
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, "") || "/";
};

/**
 * @returns маршрут expo-router или `null`, если пути нет соответствия на мобилке.
 */
export const resolveWebPathToMobileRoute = (rawPath: string): string | null => {
  const path = normalizeWebPath(rawPath);
  const lower = path.toLowerCase();

  if (WEB_ONLY_PATHS.has(lower)) {
    return null;
  }

  const staticRoute = STATIC_PATH_ROUTES[lower];
  if (staticRoute) {
    return staticRoute;
  }

  const legalMatch = lower.match(/^\/legal\/([^/?#]+)$/);
  if (legalMatch?.[1]) {
    return LEGAL_KINDS.has(legalMatch[1]) ? `/legal/${legalMatch[1]}` : "/legal/terms";
  }

  const userMatch = path.match(/^\/user\/([^/?#]+)$/i);
  if (userMatch?.[1]) {
    const userId = decodeURIComponent(userMatch[1]);
    return RESERVED_USER_PATH_SEGMENTS.has(userId.toLowerCase())
      ? null
      : `/user/${userId}`;
  }

  for (const { pattern, build } of DYNAMIC_SEGMENT_ROUTES) {
    const match = path.match(pattern);
    if (match?.[1]) {
      return build(decodeURIComponent(match[1]));
    }
  }

  // Вложенные пути раздела схлопываем к самому разделу: `/orders/64f…` — это
  // всё ещё «Мои заказы», отдельного экрана заказа на мобилке нет.
  const firstSegment = lower.split("/")[1];
  if (firstSegment) {
    const sectionRoute = STATIC_PATH_ROUTES[`/${firstSegment}`];
    if (sectionRoute && !WEB_ONLY_PATHS.has(`/${firstSegment}`)) {
      return sectionRoute;
    }
  }

  return null;
};
