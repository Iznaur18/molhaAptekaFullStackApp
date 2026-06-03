export const PROFILE_TAB_OVERVIEW = "overview";
export const PROFILE_TAB_MY_PRODUCTS = "my-products";
export const PROFILE_TAB_MY_SALES = "my-sales";
export const PROFILE_TAB_MY_ORDERS = "my-orders";
export const PROFILE_TAB_AUCTION = "auction";
export const PROFILE_TAB_SUBSCRIPTIONS = "subscriptions";
export const PROFILE_TAB_PREMIUM = "premium";
export const PROFILE_TAB_LOYALTY_POINTS = "loyalty-points";
export const PROFILE_TAB_ADMIN_ORDERS = "admin-orders";
export const PROFILE_TAB_PRODUCT_MODERATION = "product-moderation";
export const PROFILE_TAB_PRODUCT_REPORTS = "product-reports";
export const PROFILE_TAB_PRODUCT_PROMOTIONS = "product-promotions";
export const PROFILE_TAB_RAFFLES = "raffles";
export const PROFILE_TAB_DATA_CONFIRMATION_REQUESTS = "data-confirmation-requests";
export const PROFILE_TAB_INSTALLMENT_PAYMENTS = "installment-payments";
export const PROFILE_TAB_INSTALLMENT_SALES = "installment-sales";
export const PROFILE_TAB_INSTALLMENT_MODERATION = "installment-moderation";
export const PROFILE_TAB_INSTALLMENT_DISPUTES = "installment-disputes";

export const PROFILE_TAB_VALUES = [
  PROFILE_TAB_OVERVIEW,
  PROFILE_TAB_MY_PRODUCTS,
  PROFILE_TAB_MY_SALES,
  PROFILE_TAB_MY_ORDERS,
  PROFILE_TAB_AUCTION,
  PROFILE_TAB_SUBSCRIPTIONS,
  PROFILE_TAB_PREMIUM,
  PROFILE_TAB_LOYALTY_POINTS,
  PROFILE_TAB_ADMIN_ORDERS,
  PROFILE_TAB_PRODUCT_MODERATION,
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
