/** Event types — sync with docs/analytics/metrics.md § Event Store */
export const ANALYTICS_EVENT_USER_REGISTERED = "user.registered";
export const ANALYTICS_EVENT_PRODUCT_VIEWED = "product.viewed";
export const ANALYTICS_EVENT_ORDER_CREATED = "order.created";
export const ANALYTICS_EVENT_ORDER_ITEM_SOLD = "order.item_sold";
export const ANALYTICS_EVENT_AD_IMPRESSION = "ad.impression";
export const ANALYTICS_EVENT_AD_CLICK = "ad.click";

export const ANALYTICS_EVENT_TYPES = [
  ANALYTICS_EVENT_USER_REGISTERED,
  ANALYTICS_EVENT_PRODUCT_VIEWED,
  ANALYTICS_EVENT_ORDER_CREATED,
  ANALYTICS_EVENT_ORDER_ITEM_SOLD,
  ANALYTICS_EVENT_AD_IMPRESSION,
  ANALYTICS_EVENT_AD_CLICK,
];

export const ANALYTICS_AD_SURFACE_INTRO = "intro_ad";
export const ANALYTICS_AD_SURFACE_SITE_HEADER = "site_header_banner";

export const ANALYTICS_AD_SURFACES = [
  ANALYTICS_AD_SURFACE_INTRO,
  ANALYTICS_AD_SURFACE_SITE_HEADER,
];

/** Fraud: >N product.viewed events per actor in this window → flag. */
export const ANALYTICS_VIEW_VELOCITY_WINDOW_MS = 60 * 60 * 1000;
export const ANALYTICS_VIEW_VELOCITY_MAX = 50;

export const ANALYTICS_EVENT_IDEMPOTENCY_KEY_MAX = 200;
export const ANALYTICS_EVENT_TYPE_MAX = 64;
