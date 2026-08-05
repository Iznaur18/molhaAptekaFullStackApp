/** Интервал cron синка 1С (мс). По умолчанию 5 минут. */
export const ONEC_SYNC_INTERVAL_MS = (() => {
  const raw = Number(process.env.ONEC_SYNC_INTERVAL_MS);
  if (Number.isFinite(raw) && raw >= 60_000) return Math.floor(raw);
  return 5 * 60 * 1000;
})();

export const ONEC_HTTP_TIMEOUT_MS = (() => {
  const raw = Number(process.env.ONEC_HTTP_TIMEOUT_MS);
  if (Number.isFinite(raw) && raw >= 3_000) return Math.floor(raw);
  return 30_000;
})();

export const ONEC_GUID_MAX_LENGTH = 64;
export const ONEC_ARTICLE_MAX_LENGTH = 64;
export const ONEC_BASE_URL_MAX_LENGTH = 500;
export const ONEC_API_KEY_MAX_LENGTH = 512;
export const ONEC_NAME_MAX_LENGTH = 200;
export const ONEC_DESCRIPTION_MAX_LENGTH = 5000;
export const ONEC_STOCK_MAX = 9999;
export const ONEC_LOG_ERROR_MAX_LENGTH = 2000;
export const ONEC_DEFAULT_CATEGORY_LABEL = "Номенклатура 1С";

/** Пути относительно baseUrl продавца (единый контракт, не завязан на версию УТ). */
export const ONEC_PATH_HEALTH = "/v1/health";
export const ONEC_PATH_NOMENCLATURE = "/v1/nomenclature";
export const ONEC_PATH_CUSTOMER_ORDERS = "/v1/customer-orders";

export const ONEC_SYNC_STATUS_IDLE = "idle";
export const ONEC_SYNC_STATUS_SUCCESS = "success";
export const ONEC_SYNC_STATUS_ERROR = "error";
export const ONEC_SYNC_STATUSES = [
  ONEC_SYNC_STATUS_IDLE,
  ONEC_SYNC_STATUS_SUCCESS,
  ONEC_SYNC_STATUS_ERROR,
];

export const ONEC_EXCHANGE_DIRECTION_PULL = "pull_nomenclature";
export const ONEC_EXCHANGE_DIRECTION_PUSH = "push_customer_order";
export const ONEC_EXCHANGE_DIRECTION_TEST = "test_connection";
export const ONEC_EXCHANGE_DIRECTION_SYNC = "full_sync";

export const ONEC_EXCHANGE_DIRECTIONS = [
  ONEC_EXCHANGE_DIRECTION_PULL,
  ONEC_EXCHANGE_DIRECTION_PUSH,
  ONEC_EXCHANGE_DIRECTION_TEST,
  ONEC_EXCHANGE_DIRECTION_SYNC,
];

export const ONEC_EXCHANGE_STATUS_SUCCESS = "success";
export const ONEC_EXCHANGE_STATUS_ERROR = "error";

export const ONEC_ORDER_PUSH_PENDING = "pending";
export const ONEC_ORDER_PUSH_SYNCED = "synced";
export const ONEC_ORDER_PUSH_FAILED = "failed";
export const ONEC_ORDER_PUSH_STATUSES = [
  ONEC_ORDER_PUSH_PENDING,
  ONEC_ORDER_PUSH_SYNCED,
  ONEC_ORDER_PUSH_FAILED,
];

export const ONEC_ORDER_PUSH_MAX_ATTEMPTS = 8;
