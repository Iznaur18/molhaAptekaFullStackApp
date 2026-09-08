export const PRODUCT_MODERATION_PENDING = "pending";
export const PRODUCT_MODERATION_APPROVED = "approved";
export const PRODUCT_MODERATION_REJECTED = "rejected";

export const PRODUCT_MODERATION_STATUSES = [
  PRODUCT_MODERATION_PENDING,
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_REJECTED,
];

/** Значения query `moderationStatus` для GET /product/my (фильтр «Мои товары»). */
export const MY_PRODUCTS_MODERATION_FILTER_VALUES = [
  PRODUCT_MODERATION_PENDING,
  PRODUCT_MODERATION_REJECTED,
];

export const PRODUCT_MODERATION_COMMENT_MAX_LENGTH = 2000;

export const IN_APP_NOTIFICATION_KIND_MODERATION_TRUST_GRANTED =
  "product_moderation_trust_granted";
export const IN_APP_NOTIFICATION_KIND_MODERATION_TRUST_REVOKED =
  "product_moderation_trust_revoked";

export const IN_APP_NOTIFICATION_MESSAGE_MODERATION_TRUST_GRANTED =
  "Ваши товары публикуются без проверки: новая карточка попадает в каталог сразу.";
export const IN_APP_NOTIFICATION_MESSAGE_MODERATION_TRUST_REVOKED =
  "Публикация без проверки отключена: новые товары снова проходят модерацию.";
