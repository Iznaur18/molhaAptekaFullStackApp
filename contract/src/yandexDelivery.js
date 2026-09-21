import { z } from "zod";

import { cdekRecipientSchema } from "./cdek.js";

/**
 * Яндекс Доставка «в другой день» — per-seller, как СДЭК: у каждого продавца
 * свой договор с Яндексом и свой токен из кабинета dostavka.yandex.ru.
 */

/** Боевой контур. */
export const YANDEX_DELIVERY_API_BASE_URL_PROD =
  "https://b2b-authproxy.taxi.yandex.net/api/b2b/platform";
/** Тестовый контур Яндекса: работает только по Москве. */
export const YANDEX_DELIVERY_API_BASE_URL_TEST =
  "https://b2b.taxi.tst.yandex.net/api/b2b/platform";

/** @type {readonly ["prod", "test"]} */
export const YANDEX_DELIVERY_ENVIRONMENTS = ["prod", "test"];
export const YANDEX_DELIVERY_ENVIRONMENT_PROD = "prod";
export const YANDEX_DELIVERY_ENVIRONMENT_TEST = "test";

export const YANDEX_DELIVERY_TOKEN_MAX_LENGTH = 512;
export const YANDEX_DELIVERY_HTTP_TIMEOUT_MS = 15_000;

export const YANDEX_DELIVERY_NOT_CONNECTED_MESSAGE =
  "Яндекс Доставка у этого продавца не подключена: нет токена";
export const YANDEX_DELIVERY_INVALID_TOKEN_MESSAGE =
  "Яндекс не принял токен: скопируйте его заново из профиля компании в кабинете Яндекс Доставки";
export const YANDEX_DELIVERY_UNAVAILABLE_MESSAGE =
  "Яндекс Доставка временно недоступна, попробуйте позже";
export const YANDEX_DELIVERY_DISABLED_MESSAGE =
  "Продавец сейчас не отправляет через Яндекс Доставку";

/**
 * @param {string | null | undefined} environment
 * @returns {string}
 */
export function resolveYandexDeliveryBaseUrl(environment) {
  return environment === YANDEX_DELIVERY_ENVIRONMENT_TEST
    ? YANDEX_DELIVERY_API_BASE_URL_TEST
    : YANDEX_DELIVERY_API_BASE_URL_PROD;
}

/** Body `PUT /user/me/yandex-delivery-credentials`. */
export const yandexDeliveryCredentialsBodySchema = z.object({
  token: z
    .string({ required_error: "Вставьте токен из кабинета Яндекс Доставки" })
    .trim()
    .min(10, "Вставьте токен из кабинета Яндекс Доставки")
    .max(YANDEX_DELIVERY_TOKEN_MAX_LENGTH)
    // Токен копируют из кабинета — пробелы внутри означают, что захватили лишнее.
    .regex(/^\S+$/, "В токене не должно быть пробелов"),
  environment: z.enum(YANDEX_DELIVERY_ENVIRONMENTS).optional(),
});

/** Body `PATCH /user/me/yandex-delivery-credentials` — тумблер. */
export const yandexDeliveryToggleBodySchema = z.object({ enabled: z.coerce.boolean() });

/** Что отдаём наружу о подключении. Сам токен — никогда. */
export const yandexDeliveryConnectionStateSchema = z.object({
  connected: z.boolean(),
  enabled: z.boolean(),
  environment: z.enum(YANDEX_DELIVERY_ENVIRONMENTS),
  tokenMasked: z.string(),
  validatedAt: z.coerce.date().nullable(),
  lastError: z.string(),
  dropoff: z
    .object({ id: z.string(), name: z.string(), address: z.string() })
    .nullable(),
  ready: z.boolean(),
});

/**
 * Маска токена: последние 4 символа.
 *
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function maskYandexDeliveryToken(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (text.length <= 8) return "••••";
  return `••••${text.slice(-4)}`;
}

export const YANDEX_DELIVERY_QUOTE_MAX_ITEMS = 50;
const yandexPointIdSchema = z.string().trim().min(1).max(64);

/** Query `GET /user/me/yandex-delivery-dropoff-points` и `/order/yandex-delivery-points`. */
export const yandexDeliveryCityQuerySchema = z.object({
  city: z.string().trim().min(2).max(100),
});

/** Query `GET /order/yandex-delivery-points`. */
export const yandexDeliveryPointsQuerySchema = yandexDeliveryCityQuerySchema.extend({
  sellerId: z
    .string()
    .trim()
    .regex(/^[a-f0-9]{24}$/i),
});

/** Body `PUT /user/me/yandex-delivery-dropoff` — пункт, куда продавец сдаёт посылки. */
export const yandexDeliveryDropoffBodySchema = z.object({
  stationId: yandexPointIdSchema,
});

/** Body `POST /order/yandex-delivery-quote`. */
export const yandexDeliveryQuoteBodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z
          .string()
          .trim()
          .regex(/^[a-f0-9]{24}$/i),
        quantity: z.coerce.number().int().min(1).max(999),
      }),
    )
    .min(1)
    .max(YANDEX_DELIVERY_QUOTE_MAX_ITEMS),
  pickupPointId: yandexPointIdSchema,
});

/**
 * Выбор покупателя в заказе: пункт выдачи и получатель. Цены нет — её
 * пересчитывает сервер ключом продавца.
 */
export const yandexDeliveryOrderSelectionSchema = z.object({
  pickupPointId: yandexPointIdSchema,
  recipient: cdekRecipientSchema,
});

export const YANDEX_DELIVERY_CARD_ONLY_MESSAGE =
  "Яндекс Доставка принимает оплату только картой в пункте выдачи — выберите «Картой при получении»";
export const YANDEX_DELIVERY_POINT_GONE_MESSAGE =
  "Пункт выдачи Яндекса не найден или не принимает оплату картой — выберите другой";
export const YANDEX_DELIVERY_NO_DROPOFF_MESSAGE =
  "Продавец ещё не выбрал пункт, куда сдаёт посылки Яндекса";
