/** Envelope marker in Mongo Mixed passport field. */
export const PASSPORT_VAULT_MARKER = 1;

/** Default KEK id when rotating keys later. */
export const PASSPORT_VAULT_DEFAULT_KEY_ID = "v1";

/** AES-256-GCM; KEK is 32 raw bytes (64 hex chars in env). */
export const PASSPORT_VAULT_ALGORITHM = "aes-256-gcm";

export const PASSPORT_VAULT_KEK_HEX_LENGTH = 64;

/** Purge order.buyerPassportShare this many days after consent. */
export const BUYER_PASSPORT_SHARE_TTL_DAYS_DEFAULT = 90;

export const BUYER_PASSPORT_SHARE_PURGE_CRON_INTERVAL_MS = 60 * 60 * 1000;

export const PASSPORT_VAULT_ACCESS_PURPOSE_STAFF_PENDING = "staff_pending_list";
export const PASSPORT_VAULT_ACCESS_PURPOSE_INSTALLMENT_SNAPSHOT =
  "installment_snapshot";
export const PASSPORT_VAULT_ACCESS_PURPOSE_SELLER_ORDER = "seller_order_share";
export const PASSPORT_VAULT_ACCESS_PURPOSE_SYSTEM_PURGE = "system_purge";

export const PASSPORT_VAULT_ACCESS_PURPOSES = [
  PASSPORT_VAULT_ACCESS_PURPOSE_STAFF_PENDING,
  PASSPORT_VAULT_ACCESS_PURPOSE_INSTALLMENT_SNAPSHOT,
  PASSPORT_VAULT_ACCESS_PURPOSE_SELLER_ORDER,
  PASSPORT_VAULT_ACCESS_PURPOSE_SYSTEM_PURGE,
];
