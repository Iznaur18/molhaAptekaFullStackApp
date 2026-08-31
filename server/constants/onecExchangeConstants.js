/**
 * CommerceML «Обмен с сайтом» — 1С сама стучится на сайт.
 *
 * Протокол (штатный в УТ 11 / Бухгалтерии / Рознице, без доработок конфигурации):
 *   каталог: checkauth → init → file (×N) → import (×N)
 *   заказы:  checkauth → init → query → success
 *
 * Отличается от «pull»-канала (`onecConstants.js`), где сайт сам ходит в HTTP-сервис 1С.
 */

/** Значения `?type=` в запросах 1С. */
export const ONEC_EXCHANGE_TYPE_CATALOG = "catalog";
export const ONEC_EXCHANGE_TYPE_SALE = "sale";
export const ONEC_EXCHANGE_TYPES = [
  ONEC_EXCHANGE_TYPE_CATALOG,
  ONEC_EXCHANGE_TYPE_SALE,
];

/** Значения `?mode=`. */
export const ONEC_EXCHANGE_MODE_CHECKAUTH = "checkauth";
export const ONEC_EXCHANGE_MODE_INIT = "init";
export const ONEC_EXCHANGE_MODE_FILE = "file";
export const ONEC_EXCHANGE_MODE_IMPORT = "import";
export const ONEC_EXCHANGE_MODE_QUERY = "query";
export const ONEC_EXCHANGE_MODE_SUCCESS = "success";
export const ONEC_EXCHANGE_MODE_COMPLETE = "complete";
export const ONEC_EXCHANGE_MODES = [
  ONEC_EXCHANGE_MODE_CHECKAUTH,
  ONEC_EXCHANGE_MODE_INIT,
  ONEC_EXCHANGE_MODE_FILE,
  ONEC_EXCHANGE_MODE_IMPORT,
  ONEC_EXCHANGE_MODE_QUERY,
  ONEC_EXCHANGE_MODE_SUCCESS,
  ONEC_EXCHANGE_MODE_COMPLETE,
];

/** Имя cookie сессии обмена. Своё, чтобы не пересекаться с auth-куками сайта. */
export const ONEC_EXCHANGE_COOKIE_NAME = "izibuy_1c_exchange";

/** Логин продавца для 1С: `1c-<12 hex>`. */
export const ONEC_EXCHANGE_LOGIN_PREFIX = "1c-";
export const ONEC_EXCHANGE_LOGIN_RANDOM_BYTES = 6;
export const ONEC_EXCHANGE_PASSWORD_BYTES = 18;
export const ONEC_EXCHANGE_LOGIN_MAX_LENGTH = 64;

/** Живёт дольше самого долгого обмена, но не бесконечно. */
export const ONEC_EXCHANGE_SESSION_TTL_SECONDS = 6 * 60 * 60;

/**
 * `file_limit` в ответе на `mode=init` — 1С режет файл на куски такого размера
 * и досылает их POST'ами с тем же `filename`, сайт склеивает append'ом.
 */
export const ONEC_EXCHANGE_FILE_CHUNK_LIMIT_BYTES = (() => {
  const raw = Number(process.env.ONEC_EXCHANGE_FILE_CHUNK_LIMIT_BYTES);
  if (Number.isFinite(raw) && raw >= 262_144) return Math.floor(raw);
  return 8 * 1024 * 1024;
})();

/** Потолок на один файл после склейки всех кусков. */
export const ONEC_EXCHANGE_MAX_FILE_BYTES = (() => {
  const raw = Number(process.env.ONEC_EXCHANGE_MAX_FILE_BYTES);
  if (Number.isFinite(raw) && raw >= 1_048_576) return Math.floor(raw);
  return 512 * 1024 * 1024;
})();

/** Потолок на всю сессию обмена (каталог + картинки). */
export const ONEC_EXCHANGE_MAX_SESSION_BYTES = (() => {
  const raw = Number(process.env.ONEC_EXCHANGE_MAX_SESSION_BYTES);
  if (Number.isFinite(raw) && raw >= 1_048_576) return Math.floor(raw);
  return 2 * 1024 * 1024 * 1024;
})();

export const ONEC_EXCHANGE_MAX_FILES_PER_SESSION = 5000;

/** ZIP разрешаем — 1С жмёт XML в разы, а картинки идут одним архивом. */
export const ONEC_EXCHANGE_ALLOW_ZIP = true;

/**
 * Rate limit: сколько сессий обмена продавец может начать за окно.
 *
 * Полный цикл 1С — это два `checkauth` (каталог и заказы), так что шесть
 * стартов = три обмена за десять минут. Для боя в самый раз, а при настройке
 * узла и отладке — мало, поэтому значение поднимается переменной окружения.
 */
export const ONEC_EXCHANGE_CHECKAUTH_WINDOW_MS = 10 * 60 * 1000;
export const ONEC_EXCHANGE_CHECKAUTH_MAX_PER_WINDOW = (() => {
  const raw = Number(process.env.ONEC_EXCHANGE_CHECKAUTH_MAX_PER_WINDOW);
  if (Number.isFinite(raw) && raw >= 1) return Math.floor(raw);
  return 6;
})();
/** Отдельный потолок на перебор пароля с одного IP (успешные не считаются). */
export const ONEC_EXCHANGE_AUTH_MAX_PER_WINDOW = 60;
/** Внутри сессии запросов много (file-чанки) — окно шире. */
export const ONEC_EXCHANGE_REQUEST_WINDOW_MS = 60 * 1000;
export const ONEC_EXCHANGE_REQUEST_MAX_PER_WINDOW = 600;

/** Канал обмена, выбранный продавцом. */
export const ONEC_CHANNEL_PULL = "pull";
export const ONEC_CHANNEL_COMMERCEML = "commerceml";
export const ONEC_CHANNELS = [ONEC_CHANNEL_PULL, ONEC_CHANNEL_COMMERCEML];

/** Статусы разбора присланного пакета. */
export const ONEC_IMPORT_STATUS_PENDING = "pending";
export const ONEC_IMPORT_STATUS_PROCESSING = "processing";
export const ONEC_IMPORT_STATUS_COMPLETED = "completed";
export const ONEC_IMPORT_STATUS_FAILED = "failed";
export const ONEC_IMPORT_STATUSES = [
  ONEC_IMPORT_STATUS_PENDING,
  ONEC_IMPORT_STATUS_PROCESSING,
  ONEC_IMPORT_STATUS_COMPLETED,
  ONEC_IMPORT_STATUS_FAILED,
];

/** Что за файл прислали (по имени из CommerceML). */
export const ONEC_IMPORT_KIND_CATALOG = "catalog";
export const ONEC_IMPORT_KIND_OFFERS = "offers";
export const ONEC_IMPORT_KIND_UNKNOWN = "unknown";

/** Разделитель «товар#характеристика» в Ид торгового предложения CommerceML. */
export const ONEC_OFFER_ID_SEPARATOR = "#";

/** `product1cGuid` вмещает GUID товара + GUID характеристики + разделитель. */
export const ONEC_EXTERNAL_ID_MAX_LENGTH = 128;

export const ONEC_CATEGORY_EXTERNAL_ID_MAX_LENGTH = 128;
export const ONEC_CATEGORY_NAME_MAX_LENGTH = 200;
export const ONEC_CATEGORY_MAPPINGS_MAX_PER_REQUEST = 500;

/** Сколько картинок максимум тянем на одну карточку из `import_files/`. */
export const ONEC_IMPORT_MAX_IMAGES_PER_PRODUCT = 10;
export const ONEC_IMPORT_MAX_IMAGE_BYTES = 12 * 1024 * 1024;

/** Пакет upsert'а — чтобы не держать весь каталог в памяти. */
export const ONEC_IMPORT_BATCH_SIZE = 200;

/** Максимум характеристик, которые переносим в карточку из ЗначенияСвойств. */
export const ONEC_IMPORT_MAX_CHARACTERISTICS = 30;

/**
 * Подписи для `ЗначенияРеквизитов` в документе заказа.
 *
 * В 1С это читает человек, а не программа: сырые `pending` и `cashOnDelivery`
 * из наших enum'ов оператору ничего не говорят.
 */
export const ONEC_ORDER_STATUS_LABELS = Object.freeze({
  pending: "Новый",
  accepted: "Принят",
  assembling: "На сборке",
  ready_for_pickup: "Готов к выдаче",
  ready_to_ship: "Готов к отгрузке",
  confirmed: "Подтверждён",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменён",
  returned: "Возвращён",
  disputed: "Спор",
});

export const ONEC_PAYMENT_METHOD_LABELS = Object.freeze({
  cashOnDelivery: "Наличными при получении",
  cardPrepaid: "Картой онлайн",
});
