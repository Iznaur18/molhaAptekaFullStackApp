import {
  normalizeProfileTab,
  PROFILE_TAB_ADMIN_ORDERS,
  PROFILE_TAB_ADMIN_ANALYTICS,
  PROFILE_TAB_AUCTION,
  PROFILE_TAB_CATEGORY_TREE_ADMIN,
  PROFILE_TAB_DATA_CONFIRMATION,
  PROFILE_TAB_DATA_CONFIRMATION_REQUESTS,
  PROFILE_TAB_COURIER,
  PROFILE_TAB_COURIER_MODERATION,
  PROFILE_TAB_COURIER_OVERVIEW,
  PROFILE_TAB_INSTALLMENT_DISPUTES,
  PROFILE_TAB_INSTALLMENT_PAYMENTS,
  PROFILE_TAB_INSTALLMENT_SALES,
  PROFILE_TAB_SHIPMENT_DISPUTES,
  PROFILE_TAB_SHIPPING_CARRIERS,
  PROFILE_TAB_LOYALTY_POINTS,
  PROFILE_TAB_PARTNER_PROGRAM,
  PROFILE_TAB_AFFILIATE_LISTINGS,
  PROFILE_TAB_ADVERTISING,
  PROFILE_TAB_ONEC_INTEGRATION,
  PROFILE_TAB_EDIT_PROFILE,
  PROFILE_TAB_MY_ORDERS,
  PROFILE_TAB_MY_PRODUCTS,
  PROFILE_TAB_MY_SALES,
  PROFILE_TAB_OVERVIEW,
  PROFILE_TAB_PREMIUM,
  PROFILE_TAB_PRODUCT_MODERATION,
  PROFILE_TAB_INTRO_AD_MODERATION,
  PROFILE_TAB_SELLER_PERSONAL_CATEGORY_MODERATION,
  PROFILE_TAB_PRODUCT_REPORTS,
  PROFILE_TAB_RAFFLES,
  PROFILE_TAB_STAFF_AUDIT_LOG_ADMIN,
  PROFILE_TAB_BROADCAST_NOTIFICATIONS_ADMIN,
  PROFILE_TAB_SEARCH_SYNONYMS_ADMIN,
  PROFILE_TAB_APP_INTRO_ADMIN,
  PROFILE_TAB_SITE_HEADER_BANNER_ADMIN,
  PROFILE_TAB_PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN,
  PROFILE_TAB_POPULAR_PRODUCTS_ADMIN,
  PROFILE_TAB_SUBSCRIPTIONS,
  PROFILE_TAB_WISHLIST,
} from "./profileTabs.js";

/** @typedef {import("../../../shared/lib/homeMainViewPaths.js").HomeMainView} HomeMainView */

/** @type {Record<string, HomeMainView>} */
export const PROFILE_TAB_TO_MAIN_VIEW = {
  [PROFILE_TAB_OVERVIEW]: "my-profile",
  [PROFILE_TAB_MY_PRODUCTS]: "my-products",
  [PROFILE_TAB_MY_SALES]: "my-sales",
  [PROFILE_TAB_MY_ORDERS]: "my-orders",
  [PROFILE_TAB_AUCTION]: "auction",
  [PROFILE_TAB_SUBSCRIPTIONS]: "subscriptions",
  [PROFILE_TAB_WISHLIST]: "wishlist",
  [PROFILE_TAB_DATA_CONFIRMATION]: "data-confirmation",
  [PROFILE_TAB_PREMIUM]: "premium",
  [PROFILE_TAB_LOYALTY_POINTS]: "loyalty-points",
  [PROFILE_TAB_PARTNER_PROGRAM]: "partner-program",
  [PROFILE_TAB_ADVERTISING]: "advertising",
  [PROFILE_TAB_ONEC_INTEGRATION]: "onec-integration",
  [PROFILE_TAB_EDIT_PROFILE]: "edit-profile",
  [PROFILE_TAB_ADMIN_ORDERS]: "admin-orders",
  [PROFILE_TAB_ADMIN_ANALYTICS]: "admin-analytics",
  [PROFILE_TAB_STAFF_AUDIT_LOG_ADMIN]: "staff-audit-log-admin",
  [PROFILE_TAB_BROADCAST_NOTIFICATIONS_ADMIN]: "broadcast-notifications-admin",
  [PROFILE_TAB_SEARCH_SYNONYMS_ADMIN]: "search-synonyms-admin",
  [PROFILE_TAB_CATEGORY_TREE_ADMIN]: "category-tree-admin",
  [PROFILE_TAB_APP_INTRO_ADMIN]: "app-intro-admin",
  [PROFILE_TAB_SITE_HEADER_BANNER_ADMIN]: "site-header-banner-admin",
  [PROFILE_TAB_POPULAR_PRODUCTS_ADMIN]: "popular-products-admin",
  [PROFILE_TAB_PRODUCT_MODERATION]: "product-moderation",
  [PROFILE_TAB_INTRO_AD_MODERATION]: "intro-ad-moderation",
  [PROFILE_TAB_SELLER_PERSONAL_CATEGORY_MODERATION]:
    "seller-personal-category-moderation",
  [PROFILE_TAB_PRODUCT_REPORTS]: "product-reports",
  [PROFILE_TAB_RAFFLES]: "staff-raffles",
  [PROFILE_TAB_DATA_CONFIRMATION_REQUESTS]: "data-confirmation-requests",
  [PROFILE_TAB_COURIER]: "courier",
  [PROFILE_TAB_COURIER_MODERATION]: "courier-moderation",
  [PROFILE_TAB_COURIER_OVERVIEW]: "courier-overview",
  [PROFILE_TAB_INSTALLMENT_PAYMENTS]: "installment-payments",
  [PROFILE_TAB_INSTALLMENT_SALES]: "installment-sales",
  [PROFILE_TAB_INSTALLMENT_DISPUTES]: "installment-disputes",
  [PROFILE_TAB_SHIPMENT_DISPUTES]: "shipment-disputes",
  [PROFILE_TAB_SHIPPING_CARRIERS]: "shipping-carriers",
};

/** @type {Map<HomeMainView, string>} */
const MAIN_VIEW_TO_PROFILE_TAB = new Map(
  Object.entries(PROFILE_TAB_TO_MAIN_VIEW).map(([tab, view]) => [view, tab]),
);

/**
 * @param {string} tab
 * @returns {HomeMainView}
 */
export function profileTabToMainView(tab) {
  if (tab === PROFILE_TAB_PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN) {
    return "site-header-banner-admin";
  }
  const normalized = normalizeProfileTab(tab);
  if (normalized === PROFILE_TAB_AFFILIATE_LISTINGS) {
    return "partner-program";
  }
  return PROFILE_TAB_TO_MAIN_VIEW[normalized] ?? "my-profile";
}

/**
 * @param {HomeMainView} view
 * @returns {string | null}
 */
export function mainViewToProfileTab(view) {
  return MAIN_VIEW_TO_PROFILE_TAB.get(view) ?? null;
}

/**
 * Экраны личного кабинета с вкладками MyProfilePage.
 *
 * @param {HomeMainView} view
 */
export function isProfileTabMainView(view) {
  return MAIN_VIEW_TO_PROFILE_TAB.has(view);
}
