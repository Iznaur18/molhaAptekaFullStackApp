export const SELLER_PERSONAL_CATEGORY_STATUS_PENDING = "pending";
export const SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE = "active";
export const SELLER_PERSONAL_CATEGORY_STATUS_EXPIRED = "expired";
export const SELLER_PERSONAL_CATEGORY_STATUS_REJECTED = "rejected";
export const SELLER_PERSONAL_CATEGORY_STATUS_CANCELLED = "cancelled";

export const SELLER_PERSONAL_CATEGORY_STATUSES = [
  SELLER_PERSONAL_CATEGORY_STATUS_PENDING,
  SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE,
  SELLER_PERSONAL_CATEGORY_STATUS_EXPIRED,
  SELLER_PERSONAL_CATEGORY_STATUS_REJECTED,
  SELLER_PERSONAL_CATEGORY_STATUS_CANCELLED,
];

export const SELLER_PERSONAL_CATEGORY_OPEN_STATUSES = [
  SELLER_PERSONAL_CATEGORY_STATUS_PENDING,
  SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE,
];

export const SELLER_PERSONAL_CATEGORY_LABEL_MAX_LENGTH = 80;
export const SELLER_PERSONAL_CATEGORY_IMAGE_URL_MAX_LENGTH = 2048;
/** Макс. одновременно active личных категорий на сайте */
export const SELLER_PERSONAL_CATEGORY_ACTIVE_SLOT_LIMIT = 200;

export const SELLER_PERSONAL_CATEGORY_DURATION_OPTIONS = [
  { code: "24h", title: "24 часа", durationHours: 24, pricePoints: 1_000 },
  { code: "7d", title: "7 дней", durationHours: 24 * 7, pricePoints: 3_000 },
  { code: "30d", title: "30 дней", durationHours: 24 * 30, pricePoints: 10_000 },
];

export const SELLER_PERSONAL_CATEGORY_REMINDER_1_DAY_MS = 24 * 60 * 60 * 1000;
export const SELLER_PERSONAL_CATEGORY_REMINDER_1_HOUR_MS = 60 * 60 * 1000;

export const SELLER_PERSONAL_CATEGORY_CRON_INTERVAL_MS = 5 * 60 * 1000;

export const SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_REJECTED =
  "seller_personal_category_rejected";
export const SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_ACTIVATED =
  "seller_personal_category_activated";
export const SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_EXPIRED =
  "seller_personal_category_expired";
export const SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_REMINDER_1_DAY =
  "seller_personal_category_reminder_1_day";
export const SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_REMINDER_1_HOUR =
  "seller_personal_category_reminder_1_hour";
export const SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_CANCELLED_BY_STAFF =
  "seller_personal_category_cancelled_by_staff";
export const SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_DELETED_BY_STAFF =
  "seller_personal_category_deleted_by_staff";

/**
 * @param {string} code
 */
export const findSellerPersonalCategoryDuration = (code) =>
  SELLER_PERSONAL_CATEGORY_DURATION_OPTIONS.find((item) => item.code === code) ?? null;
