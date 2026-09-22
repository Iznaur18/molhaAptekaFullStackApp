/** Базовый URL API Wayset (ЛОБО). Переопределяется LOBO_API_BASE_URL. */
export const LOBO_API_BASE_URL_DEFAULT = "https://services.wayset.ru/api/v1/external";

/** Тариф по умолчанию — «Легковой», до 20 кг. Коды — в GET /cities. */
export const LOBO_DEFAULT_TARIFF = "car";

/**
 * Покупатель платит курьеру при получении. У Wayset для этого только
 * «cash»; «online» — оплата через их приложение, нам не подходит.
 */
export const LOBO_PAYMENT_METHOD = "cash";

export const LOBO_HTTP_TIMEOUT_MS = 20_000;

/** У API лимит 60 запросов в минуту на IP — держимся заметно ниже. */
export const LOBO_RATE_LIMIT_PER_MINUTE = 60;

/** Как часто опрашиваем статусы: вебхуков у ЛОБО нет. */
export const LOBO_POLL_INTERVAL_MS = 3 * 60 * 1000;

/** Статусы заказа в Wayset (GET /docs → statuses). */
export const LOBO_STATUS_DRAFT = "draft";
export const LOBO_STATUS_NEW = "new";
/** Заказ склеили с другим в один рейс — для нас это всё ещё «ждём курьера». */
export const LOBO_STATUS_MERGED = "merged";
export const LOBO_STATUS_ASSIGNED = "assigned";
export const LOBO_STATUS_ACCEPTED = "accepted";
export const LOBO_STATUS_ARRIVED = "arrived";
/** «Забран»: груз у курьера. */
export const LOBO_STATUS_IN_PROGRESS = "in_progress";
/** «Доставлен». */
export const LOBO_STATUS_DONE = "done";
export const LOBO_STATUS_CANCELLED = "cancelled";

export const LOBO_STATUSES = Object.freeze([
  LOBO_STATUS_DRAFT,
  LOBO_STATUS_NEW,
  LOBO_STATUS_MERGED,
  LOBO_STATUS_ASSIGNED,
  LOBO_STATUS_ACCEPTED,
  LOBO_STATUS_ARRIVED,
  LOBO_STATUS_IN_PROGRESS,
  LOBO_STATUS_DONE,
  LOBO_STATUS_CANCELLED,
]);

/**
 * Отмена возможна, пока курьер не забрал груз, — дальше только через спор.
 * Список держим отдельно: это правило службы, а не наше.
 */
export const LOBO_CANCELLABLE_STATUSES = Object.freeze([
  LOBO_STATUS_DRAFT,
  LOBO_STATUS_NEW,
  LOBO_STATUS_MERGED,
  LOBO_STATUS_ASSIGNED,
  LOBO_STATUS_ACCEPTED,
  LOBO_STATUS_ARRIVED,
]);

export const LOBO_NOT_CONFIGURED_MESSAGE = "Доставка ЛОБО не настроена: нет ключей API";
export const LOBO_UNAVAILABLE_MESSAGE = "Служба ЛОБО не отвечает — попробуйте позже";

/** Службу выключил админ: не ошибка пользователя, а решение платформы. */
export const SHIPPING_CARRIER_DISABLED_MESSAGE = "Эта служба доставки сейчас отключена";
