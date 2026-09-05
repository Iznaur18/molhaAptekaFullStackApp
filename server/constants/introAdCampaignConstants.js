export const INTRO_AD_CAMPAIGN_STATUS_PENDING = "pending";
/**
 * Модерация пройдена, ждём оплату по СБП. В показ ролик ещё не идёт.
 *
 * Появился, когда реклама перестала резервировать баллы: теперь площадка
 * сначала смотрит ролик и только потом берёт деньги — за отклонённую
 * заявку рекламодатель не платит вовсе.
 */
export const INTRO_AD_CAMPAIGN_STATUS_AWAITING_PAYMENT = "awaiting_payment";
export const INTRO_AD_CAMPAIGN_STATUS_QUEUED = "queued";
export const INTRO_AD_CAMPAIGN_STATUS_ACTIVE = "active";
export const INTRO_AD_CAMPAIGN_STATUS_EXPIRED = "expired";
export const INTRO_AD_CAMPAIGN_STATUS_REJECTED = "rejected";
export const INTRO_AD_CAMPAIGN_STATUS_CANCELLED = "cancelled";

export const INTRO_AD_CAMPAIGN_STATUSES = [
  INTRO_AD_CAMPAIGN_STATUS_PENDING,
  INTRO_AD_CAMPAIGN_STATUS_AWAITING_PAYMENT,
  INTRO_AD_CAMPAIGN_STATUS_QUEUED,
  INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
  INTRO_AD_CAMPAIGN_STATUS_EXPIRED,
  INTRO_AD_CAMPAIGN_STATUS_REJECTED,
  INTRO_AD_CAMPAIGN_STATUS_CANCELLED,
];

export const INTRO_AD_CAMPAIGN_OPEN_STATUSES = [
  INTRO_AD_CAMPAIGN_STATUS_PENDING,
  // Неоплаченная заявка тоже занимает слот: иначе рекламодатель подал бы
  // десять и оплатил ту, что дешевле.
  INTRO_AD_CAMPAIGN_STATUS_AWAITING_PAYMENT,
  INTRO_AD_CAMPAIGN_STATUS_QUEUED,
  INTRO_AD_CAMPAIGN_STATUS_ACTIVE,
];

export const INTRO_AD_PRICE_POINTS = 6_000;

/** Цена в рублях. Баллы и рубли у площадки 1:1, поэтому число то же. */
export const INTRO_AD_PRICE_RUB = 6_000;

/** Сколько платных intro-роликов может крутиться одновременно (проигрываются подряд). */
export const INTRO_AD_MAX_ACTIVE = 5;

export const INTRO_AD_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

export const INTRO_AD_CRON_INTERVAL_MS = 5 * 60 * 1000;

export const INTRO_AD_CTA_TYPE_SELLER_PRODUCTS = "seller_products";
export const INTRO_AD_CTA_TYPE_PROFILE = "profile";

export const INTRO_AD_CTA_TYPES = [
  INTRO_AD_CTA_TYPE_SELLER_PRODUCTS,
  INTRO_AD_CTA_TYPE_PROFILE,
];

export const INTRO_AD_NOTIFICATION_KIND_APPROVED = "intro_ad_approved";
export const INTRO_AD_NOTIFICATION_KIND_REJECTED = "intro_ad_rejected";
export const INTRO_AD_NOTIFICATION_KIND_ACTIVATED = "intro_ad_activated";
export const INTRO_AD_NOTIFICATION_KIND_EXPIRED = "intro_ad_expired";
export const INTRO_AD_NOTIFICATION_KIND_CANCELLED_BY_STAFF =
  "intro_ad_cancelled_by_staff";
