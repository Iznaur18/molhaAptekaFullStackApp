import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";

/**
 * СДЭК подключается per-seller: у каждого продавца свой договор и свои ключи
 * (docs/product/cdek-per-seller-v1.md). Платформа за его отправки не платит,
 * поэтому и ключи платформенными быть не могут.
 */

/** Боевой контур. */
export const CDEK_API_BASE_URL_PROD = "https://api.cdek.ru/v2";
/** Тестовый контур: те же методы, отправки не создаются реально. */
export const CDEK_API_BASE_URL_TEST = "https://api.edu.cdek.ru/v2";

/** @type {readonly ["prod", "test"]} */
export const CDEK_ENVIRONMENTS = ["prod", "test"];
export const CDEK_ENVIRONMENT_PROD = "prod";
export const CDEK_ENVIRONMENT_TEST = "test";

export const CDEK_ACCOUNT_MAX_LENGTH = 128;
export const CDEK_SECURE_MAX_LENGTH = 128;

/** Токен СДЭК живёт час; обновляем заранее, чтобы не ловить 401 на середине. */
export const CDEK_TOKEN_TTL_MS = 55 * 60 * 1000;
export const CDEK_HTTP_TIMEOUT_MS = 15_000;

export const CDEK_NOT_CONNECTED_MESSAGE =
  "СДЭК у этого продавца не подключён: нет ключей API";
export const CDEK_INVALID_CREDENTIALS_MESSAGE =
  "СДЭК не принял ключи: проверьте Account и Secure password";
export const CDEK_UNAVAILABLE_MESSAGE = "СДЭК временно недоступен, попробуйте позже";

/**
 * @param {string | null | undefined} environment
 * @returns {string}
 */
export function resolveCdekBaseUrl(environment) {
  return environment === CDEK_ENVIRONMENT_TEST
    ? CDEK_API_BASE_URL_TEST
    : CDEK_API_BASE_URL_PROD;
}

/** Body `PUT /user/me/cdek-credentials`. */
export const cdekCredentialsBodySchema = z.object({
  account: z
    .string({ required_error: "Укажите Account из кабинета СДЭК" })
    .trim()
    .min(1, "Укажите Account из кабинета СДЭК")
    .max(CDEK_ACCOUNT_MAX_LENGTH),
  secure: z
    .string({ required_error: "Укажите Secure password из кабинета СДЭК" })
    .trim()
    .min(1, "Укажите Secure password из кабинета СДЭК")
    .max(CDEK_SECURE_MAX_LENGTH),
  environment: z.enum(CDEK_ENVIRONMENTS).optional(),
});

/**
 * Что отдаём наружу о подключении. Секрет не отдаём никогда — только признак
 * «подключено» и маска, чтобы продавец узнал свой ключ.
 */
export const cdekConnectionStateSchema = z.object({
  connected: z.boolean(),
  environment: z.enum(CDEK_ENVIRONMENTS),
  accountMasked: z.string(),
  validatedAt: z.coerce.date().nullable(),
  lastError: z.string(),
});

/**
 * Режимы доставки СДЭК. В v1 работаем только с выдачей в пункте:
 * 2 — от двери продавца до пункта, 4 — от пункта до пункта.
 */
export const CDEK_DELIVERY_MODE_DOOR_TO_POINT = 2;
export const CDEK_DELIVERY_MODE_POINT_TO_POINT = 4;

/** @type {readonly [2, 4]} */
export const CDEK_PICKUP_DELIVERY_MODES = [
  CDEK_DELIVERY_MODE_DOOR_TO_POINT,
  CDEK_DELIVERY_MODE_POINT_TO_POINT,
];

/** Тип заказа СДЭК: 1 — интернет-магазин. */
export const CDEK_ORDER_TYPE_SHOP = 1;
/** Валюта расчёта: 1 — рубли. */
export const CDEK_CURRENCY_RUB = 1;

/**
 * Габариты и вес по умолчанию: у товара таких полей пока нет, а без них СДЭК
 * не посчитает. Значения намеренно «средняя коробка», продавец уточнит их
 * при создании накладной.
 */
export const CDEK_DEFAULT_ITEM_WEIGHT_G = 1000;
export const CDEK_DEFAULT_PACKAGE_CM = { length: 30, width: 20, height: 15 };
/** Больше этого в один расчёт не берём: корзина с сотней позиций — не посылка. */
export const CDEK_QUOTE_MAX_ITEMS = 50;

/** Body `POST /order/cdek-quote` — расчёт до оформления заказа. */
export const cdekQuoteBodySchema = z.object({
  productIds: z.array(mongoIdSchema).min(1).max(CDEK_QUOTE_MAX_ITEMS),
  /** Код города получателя в справочнике СДЭК либо индекс. */
  toCityCode: z.coerce.number().int().positive().optional(),
  toPostalCode: z.string().trim().min(3).max(20).optional(),
  toAddress: z.string().trim().min(3).max(200).optional(),
});

/** Query `GET /order/cdek-delivery-points`. */
export const cdekDeliveryPointsQuerySchema = z.object({
  sellerId: mongoIdSchema,
  cityCode: z.coerce.number().int().positive().optional(),
  postalCode: z.string().trim().min(3).max(20).optional(),
  /** Название города: код справочника СДЭК ищем по нему, если кода нет. */
  city: z.string().trim().min(2).max(100).optional(),
});

/** Выбор покупателя в заказе: тариф, пункт выдачи и город. Без цены — её считает сервер. */
export const cdekOrderSelectionSchema = z.object({
  tariffCode: z.coerce.number().int().positive(),
  pickupPointCode: z.string().trim().min(1).max(32),
  toCityCode: z.coerce.number().int().positive(),
});

export const CDEK_TARIFF_GONE_MESSAGE =
  "Выбранный тариф СДЭК больше недоступен — выберите доставку заново";
export const CDEK_POINT_GONE_MESSAGE =
  "Пункт выдачи СДЭК не найден или не выдаёт заказы — выберите другой";

/** Одна строка расчёта: тариф, цена и срок. */
export const cdekTariffOptionSchema = z.object({
  tariffCode: z.number().int(),
  tariffName: z.string(),
  deliveryMode: z.number().int(),
  deliverySumRub: z.number().nonnegative(),
  periodMinDays: z.number().int().nonnegative().nullable(),
  periodMaxDays: z.number().int().nonnegative().nullable(),
});

/** Пункт выдачи в том виде, в каком он нужен экрану выбора. */
export const cdekDeliveryPointSchema = z.object({
  code: z.string(),
  name: z.string(),
  address: z.string(),
  cityCode: z.number().int().nullable(),
  city: z.string(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
  workTime: z.string(),
  hasCashless: z.boolean(),
});

/**
 * Маска ключа: последние 4 символа, остальное скрыто.
 *
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function maskCdekAccount(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (text.length <= 4) return "••••";
  return `••••${text.slice(-4)}`;
}
