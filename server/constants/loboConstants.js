/** Базовый URL DMS ЛОБО. Переопределяется LOBO_API_BASE_URL. */
export const LOBO_API_BASE_URL_DEFAULT = "https://operator.wayset.ru/api/v1/external";

export const LOBO_HTTP_TIMEOUT_MS = 20_000;

/** У API лимит 60 запросов в минуту на IP — держимся заметно ниже. */
export const LOBO_RATE_LIMIT_PER_MINUTE = 60;

/** Как часто опрашиваем статусы: вебхуков у ЛОБО нет. */
export const LOBO_POLL_INTERVAL_MS = 3 * 60 * 1000;

/** Статусы заказа в DMS. */
export const LOBO_STATUS_DRAFT = "draft";
export const LOBO_STATUS_CREATED = "created";
export const LOBO_STATUS_ASSIGNED = "assigned";
export const LOBO_STATUS_ACCEPTED = "accepted";
export const LOBO_STATUS_ARRIVED = "arrived";
export const LOBO_STATUS_PICKED_UP = "picked_up";
export const LOBO_STATUS_DELIVERED = "delivered";
export const LOBO_STATUS_CANCELLED = "cancelled";

export const LOBO_STATUSES = Object.freeze([
  LOBO_STATUS_DRAFT,
  LOBO_STATUS_CREATED,
  LOBO_STATUS_ASSIGNED,
  LOBO_STATUS_ACCEPTED,
  LOBO_STATUS_ARRIVED,
  LOBO_STATUS_PICKED_UP,
  LOBO_STATUS_DELIVERED,
  LOBO_STATUS_CANCELLED,
]);

/**
 * Отмена возможна, пока курьер не забрал груз, — дальше только через спор.
 * Список держим отдельно: это правило службы, а не наше.
 */
export const LOBO_CANCELLABLE_STATUSES = Object.freeze([
  LOBO_STATUS_DRAFT,
  LOBO_STATUS_CREATED,
  LOBO_STATUS_ASSIGNED,
  LOBO_STATUS_ACCEPTED,
  LOBO_STATUS_ARRIVED,
]);

export const LOBO_NOT_CONFIGURED_MESSAGE =
  "Доставка ЛОБО не настроена: нет ключей API";
export const LOBO_UNAVAILABLE_MESSAGE =
  "Служба ЛОБО не отвечает — попробуйте позже";

/** Службу выключил админ: не ошибка пользователя, а решение платформы. */
export const SHIPPING_CARRIER_DISABLED_MESSAGE =
  "Эта служба доставки сейчас отключена";
