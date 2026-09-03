/**
 * ЮKassa: приём онлайн-платежей и чеки по 54-ФЗ.
 *
 * Ключи одни на площадку и живут в окружении. Без пары shopId + секретный
 * ключ интеграция считается ненастроенной, и оплата картой не предлагается
 * вовсе — вместо неё пользователь видит прежнюю заглушку.
 */

export const YOOKASSA_API_BASE_URL_DEFAULT = "https://api.yookassa.ru/v3";

export const YOOKASSA_HTTP_TIMEOUT_MS = 20_000;

/** Статусы платежа в ЮKassa. */
export const YOOKASSA_PAYMENT_STATUS_PENDING = "pending";
export const YOOKASSA_PAYMENT_STATUS_WAITING_FOR_CAPTURE = "waiting_for_capture";
export const YOOKASSA_PAYMENT_STATUS_SUCCEEDED = "succeeded";
export const YOOKASSA_PAYMENT_STATUS_CANCELED = "canceled";

export const YOOKASSA_PAYMENT_STATUSES = Object.freeze([
  YOOKASSA_PAYMENT_STATUS_PENDING,
  YOOKASSA_PAYMENT_STATUS_WAITING_FOR_CAPTURE,
  YOOKASSA_PAYMENT_STATUS_SUCCEEDED,
  YOOKASSA_PAYMENT_STATUS_CANCELED,
]);

/** За что платит пользователь. */
export const PAYMENT_PURPOSE_LOYALTY_POINTS = "loyalty_points";
/**
 * Предоплата заказа.
 *
 * Пока — только товары самой площадки: деньги приходят на её же счёт. Для
 * чужих продавцов сюда добавится сплит, и это будет тот же платёж с массивом
 * получателей, а не другая схема.
 */
export const PAYMENT_PURPOSE_ORDER = "order";

export const PAYMENT_PURPOSES = Object.freeze([
  PAYMENT_PURPOSE_LOYALTY_POINTS,
  PAYMENT_PURPOSE_ORDER,
]);

/**
 * Продавцы, за чей товар площадка вправе принимать деньги на свой счёт.
 *
 * Сейчас это она сама. Пустой список выключает предоплату картой вовсе —
 * безопасное значение по умолчанию: случайно собрать чужие деньги нельзя.
 *
 * @returns {string[]}
 */
export function resolvePlatformSellerUserIds() {
  return String(process.env.PLATFORM_SELLER_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

/** Наш внутренний статус платежа: не путать со статусом у провайдера. */
export const PAYMENT_STATUS_CREATED = "created";
export const PAYMENT_STATUS_SUCCEEDED = "succeeded";
export const PAYMENT_STATUS_CANCELED = "canceled";

export const PAYMENT_STATUSES = Object.freeze([
  PAYMENT_STATUS_CREATED,
  PAYMENT_STATUS_SUCCEEDED,
  PAYMENT_STATUS_CANCELED,
]);

/**
 * Система налогообложения магазина для чека.
 *
 * 1 — ОСН, 2 — УСН доходы, 3 — УСН доходы минус расходы, 4 — ЕСХН, 5 — ПСН.
 * Значение по умолчанию — УСН доходы; подтвердить у бухгалтера, иначе чек
 * уедет с неверной системой и его придётся сторнировать.
 */
export const YOOKASSA_TAX_SYSTEM_CODE_DEFAULT = 2;

/**
 * Ставка НДС в позиции чека.
 *
 * 1 — без НДС, 2 — 0%, 3 — 10%, 4 — 20%, 5 — 10/110, 6 — 20/120.
 * На УСН это «без НДС».
 */
export const YOOKASSA_VAT_CODE_DEFAULT = 1;

/**
 * Признак предмета расчёта для баллов.
 *
 * Баллы — не товар, а предоплата за услуги площадки, поэтому `payment`
 * («платёж»), а не `commodity`.
 */
export const YOOKASSA_POINTS_PAYMENT_SUBJECT = "payment";

/** Товар в чеке заказа — обычный предмет расчёта. */
export const YOOKASSA_ORDER_PAYMENT_SUBJECT = "commodity";

/** Признак способа расчёта: полная оплата в момент покупки. */
export const YOOKASSA_POINTS_PAYMENT_MODE = "full_payment";

export const YOOKASSA_NOT_CONFIGURED_MESSAGE =
  "Оплата картой пока недоступна — идёт подключение платёжного сервиса";

export const YOOKASSA_UNAVAILABLE_MESSAGE =
  "Платёжный сервис временно недоступен, попробуйте позже";

/** Сколько минимально можно пополнить: ниже комиссия съедает платёж. */
export const LOYALTY_POINTS_TOPUP_MIN_RUB = 1;
export const LOYALTY_POINTS_TOPUP_MAX_RUB = 999_999;

/**
 * Уведомления ЮKassa приходят без подписи, поэтому телу письма мы не верим:
 * по `object.id` из уведомления платёж перезапрашивается в API, и решение
 * принимается уже по ответу самого ЮKassa.
 */
export const YOOKASSA_WEBHOOK_EVENT_PAYMENT_SUCCEEDED = "payment.succeeded";
export const YOOKASSA_WEBHOOK_EVENT_PAYMENT_CANCELED = "payment.canceled";

export const YOOKASSA_WEBHOOK_EVENTS = Object.freeze([
  YOOKASSA_WEBHOOK_EVENT_PAYMENT_SUCCEEDED,
  YOOKASSA_WEBHOOK_EVENT_PAYMENT_CANCELED,
]);
