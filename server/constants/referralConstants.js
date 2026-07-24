/** Доля партнёрского кэшбэка от списанных баллов реферала (v1). */
export const REFERRAL_CASHBACK_PERCENT = 10;

export const REFERRAL_CODE_LENGTH = 8;

/** Без 0/O/1/I — читаемый код для ссылок. */
export const REFERRAL_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export const REFERRAL_CODE_PATTERN = new RegExp(
  `^[${REFERRAL_CODE_ALPHABET}]{${REFERRAL_CODE_LENGTH}}$`,
);

export const REFERRAL_SOURCE_KIND_PREMIUM = "premium";
export const REFERRAL_SOURCE_KIND_PRODUCT_PROMOTION = "product_promotion";
export const REFERRAL_SOURCE_KIND_INTRO_AD = "intro_ad";
export const REFERRAL_SOURCE_KIND_SITE_HEADER_BANNER = "site_header_banner";
export const REFERRAL_SOURCE_KIND_SELLER_PERSONAL_CATEGORY =
  "seller_personal_category";
export const REFERRAL_SOURCE_KIND_RAFFLE_CREATE_UNLOCK = "raffle_create_unlock";
export const REFERRAL_SOURCE_KIND_CONVERSION = "conversion";

export const REFERRAL_SOURCE_KINDS = [
  REFERRAL_SOURCE_KIND_PREMIUM,
  REFERRAL_SOURCE_KIND_PRODUCT_PROMOTION,
  REFERRAL_SOURCE_KIND_INTRO_AD,
  REFERRAL_SOURCE_KIND_SITE_HEADER_BANNER,
  REFERRAL_SOURCE_KIND_SELLER_PERSONAL_CATEGORY,
  REFERRAL_SOURCE_KIND_RAFFLE_CREATE_UNLOCK,
  REFERRAL_SOURCE_KIND_CONVERSION,
];

export const REFERRAL_LEDGER_ENTRY_CREDIT = "credit";
export const REFERRAL_LEDGER_ENTRY_REVERSAL = "reversal";
export const REFERRAL_LEDGER_ENTRY_CONVERSION = "conversion";

export const REFERRAL_LEDGER_ENTRY_TYPES = [
  REFERRAL_LEDGER_ENTRY_CREDIT,
  REFERRAL_LEDGER_ENTRY_REVERSAL,
  REFERRAL_LEDGER_ENTRY_CONVERSION,
];

export const IN_APP_NOTIFICATION_KIND_REFERRAL_CASHBACK =
  "referral_cashback_credited";

export const IN_APP_NOTIFICATION_MESSAGE_REFERRAL_CASHBACK = (amount) =>
  `Партнёрский кэшбэк: +${amount} на партнёрский баланс`;

export const REFERRAL_QUERY_PARAM = "ref";

export const REFERRAL_INVALID_CODE_MESSAGE = "Некорректный реферальный код";
export const REFERRAL_INSUFFICIENT_BALANCE_MESSAGE =
  "Недостаточно средств на партнёрском балансе";
