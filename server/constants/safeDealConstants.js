/**
 * Безопасная сделка — не отдельная сущность, а состояние продавца: подтвердил
 * ИП или ООО и прошёл модерацию. Пока подтверждения нет, продавец торгует как
 * раньше — договорились сами, наличными или переводом.
 *
 * Деньги через площадку уходят только ИП и ООО: выплата физлицу без статуса
 * делает площадку налоговым агентом, а самозанятому запрещена перепродажа
 * чужого товара.
 */

/** Заявку не подавал ни разу. */
export const SAFE_DEAL_MODERATION_NONE = "none";
export const SAFE_DEAL_MODERATION_PENDING = "pending";
export const SAFE_DEAL_MODERATION_APPROVED = "approved";
export const SAFE_DEAL_MODERATION_REJECTED = "rejected";

export const SAFE_DEAL_MODERATION_STATUSES = [
  SAFE_DEAL_MODERATION_NONE,
  SAFE_DEAL_MODERATION_PENDING,
  SAFE_DEAL_MODERATION_APPROVED,
  SAFE_DEAL_MODERATION_REJECTED,
];

export const SELLER_LEGAL_FORM_NONE = "";
export const SELLER_LEGAL_FORM_IP = "ip";
export const SELLER_LEGAL_FORM_OOO = "ooo";

/** В схеме нужен и пустой вариант: у большинства продавцов формы нет. */
export const SELLER_LEGAL_FORM_VALUES = [
  SELLER_LEGAL_FORM_NONE,
  SELLER_LEGAL_FORM_IP,
  SELLER_LEGAL_FORM_OOO,
];

/** ИНН физлица (ИП) — 12 цифр, организации — 10. */
export const SAFE_DEAL_INN_MAX_LENGTH = 12;
export const SAFE_DEAL_MODERATION_COMMENT_MAX_LENGTH = 500;

export const SAFE_DEAL_ALREADY_PENDING_MESSAGE =
  "Заявка уже на рассмотрении — дождитесь решения модератора";

export const SAFE_DEAL_NO_APPLICATION_MESSAGE =
  "Продавец не подавал заявку на безопасную сделку";

export const SAFE_DEAL_INN_TAKEN_MESSAGE =
  "Этот ИНН уже подтверждён другим продавцом";

/** In-app: модератор принял решение по заявке. */
export const IN_APP_NOTIFICATION_KIND_SAFE_DEAL_MODERATION = "safe_deal_moderation";

export const SAFE_DEAL_MODERATION_MESSAGES = Object.freeze({
  [SAFE_DEAL_MODERATION_APPROVED]:
    "Безопасная сделка подключена — покупатели видят значок на ваших товарах",
  [SAFE_DEAL_MODERATION_REJECTED]: "Заявка на безопасную сделку отклонена",
});
