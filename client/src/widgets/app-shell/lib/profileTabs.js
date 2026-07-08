export const PROFILE_TAB_OVERVIEW = "overview";
export const PROFILE_TAB_MY_PRODUCTS = "my-products";
export const PROFILE_TAB_MY_SALES = "my-sales";
export const PROFILE_TAB_MY_ORDERS = "my-orders";
export const PROFILE_TAB_AUCTION = "auction";
export const PROFILE_TAB_SUBSCRIPTIONS = "subscriptions";
export const PROFILE_TAB_WISHLIST = "wishlist";
export const PROFILE_TAB_DATA_CONFIRMATION = "data-confirmation";
export const PROFILE_TAB_PREMIUM = "premium";
export const PROFILE_TAB_LOYALTY_POINTS = "loyalty-points";
export const PROFILE_TAB_ADVERTISING = "advertising";
export const PROFILE_TAB_ADMIN_ORDERS = "admin-orders";
export const PROFILE_TAB_SEARCH_SYNONYMS_ADMIN = "search-synonyms-admin";
export const PROFILE_TAB_CATEGORY_TREE_ADMIN = "category-tree-admin";
export const PROFILE_TAB_APP_INTRO_ADMIN = "app-intro-admin";
export const PROFILE_TAB_SITE_HEADER_BANNER_ADMIN = "site-header-banner-admin";
export const PROFILE_TAB_PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN =
  "product-manage-toggle-display-admin";
export const PROFILE_TAB_POPULAR_PRODUCTS_ADMIN = "popular-products-admin";
export const PROFILE_TAB_PRODUCT_MODERATION = "product-moderation";
export const PROFILE_TAB_INTRO_AD_MODERATION = "intro-ad-moderation";
export const PROFILE_TAB_SELLER_PERSONAL_CATEGORY_MODERATION =
  "seller-personal-category-moderation";
export const PROFILE_TAB_PRODUCT_REPORTS = "product-reports";
export const PROFILE_TAB_PRODUCT_PROMOTIONS = "product-promotions";
export const PROFILE_TAB_RAFFLES = "raffles";
export const PROFILE_TAB_DATA_CONFIRMATION_REQUESTS = "data-confirmation-requests";
export const PROFILE_TAB_INSTALLMENT_PAYMENTS = "installment-payments";
export const PROFILE_TAB_INSTALLMENT_SALES = "installment-sales";
export const PROFILE_TAB_INSTALLMENT_MODERATION = "installment-moderation";
export const PROFILE_TAB_INSTALLMENT_DISPUTES = "installment-disputes";

export const PROFILE_FULL_WIDTH_CATALOG_TABS = new Set([
  PROFILE_TAB_MY_PRODUCTS,
  PROFILE_TAB_PRODUCT_MODERATION,
]);

/**
 * @param {string} tab
 */
export function isFullWidthCatalogProfileTab(tab) {
  return PROFILE_FULL_WIDTH_CATALOG_TABS.has(tab);
}

export const PROFILE_TAB_VALUES = [
  PROFILE_TAB_OVERVIEW,
  PROFILE_TAB_MY_PRODUCTS,
  PROFILE_TAB_MY_SALES,
  PROFILE_TAB_MY_ORDERS,
  PROFILE_TAB_AUCTION,
  PROFILE_TAB_SUBSCRIPTIONS,
  PROFILE_TAB_WISHLIST,
  PROFILE_TAB_DATA_CONFIRMATION,
  PROFILE_TAB_PREMIUM,
  PROFILE_TAB_LOYALTY_POINTS,
  PROFILE_TAB_ADVERTISING,
  PROFILE_TAB_ADMIN_ORDERS,
  PROFILE_TAB_SEARCH_SYNONYMS_ADMIN,
  PROFILE_TAB_CATEGORY_TREE_ADMIN,
  PROFILE_TAB_APP_INTRO_ADMIN,
  PROFILE_TAB_SITE_HEADER_BANNER_ADMIN,
  PROFILE_TAB_POPULAR_PRODUCTS_ADMIN,
  PROFILE_TAB_PRODUCT_MODERATION,
  PROFILE_TAB_INTRO_AD_MODERATION,
  PROFILE_TAB_SELLER_PERSONAL_CATEGORY_MODERATION,
  PROFILE_TAB_PRODUCT_REPORTS,
  PROFILE_TAB_PRODUCT_PROMOTIONS,
  PROFILE_TAB_RAFFLES,
  PROFILE_TAB_DATA_CONFIRMATION_REQUESTS,
  PROFILE_TAB_INSTALLMENT_PAYMENTS,
  PROFILE_TAB_INSTALLMENT_SALES,
  PROFILE_TAB_INSTALLMENT_MODERATION,
  PROFILE_TAB_INSTALLMENT_DISPUTES,
];

/**
 * @param {string | null} raw
 */
export function normalizeProfileTab(raw) {
  if (!raw) return PROFILE_TAB_OVERVIEW;
  return PROFILE_TAB_VALUES.includes(raw) ? raw : PROFILE_TAB_OVERVIEW;
}
