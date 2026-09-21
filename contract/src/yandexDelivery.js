import { z } from "zod";

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
