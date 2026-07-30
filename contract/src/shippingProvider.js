import { z } from "zod";

/** Провайдеры доставки (каркас; live API — позже). */
export const SHIPPING_PROVIDER_CDEK = "cdek";
export const SHIPPING_PROVIDER_YANDEX_DELIVERY = "yandex_delivery";
export const SHIPPING_PROVIDER_RUSSIAN_POST = "russian_post";

/** @type {readonly ["cdek", "yandex_delivery", "russian_post"]} */
export const SHIPPING_PROVIDERS = [
  SHIPPING_PROVIDER_CDEK,
  SHIPPING_PROVIDER_YANDEX_DELIVERY,
  SHIPPING_PROVIDER_RUSSIAN_POST,
];

export const SHIPPING_PROVIDER_LABEL_RU = {
  [SHIPPING_PROVIDER_CDEK]: "СДЭК",
  [SHIPPING_PROVIDER_YANDEX_DELIVERY]: "Яндекс Доставка",
  [SHIPPING_PROVIDER_RUSSIAN_POST]: "Почта России",
};

export const SHIPPING_SERVICE_PICKUP_POINT = "pickup_point";
export const SHIPPING_SERVICE_COURIER = "courier";

/** @type {readonly ["pickup_point", "courier"]} */
export const SHIPPING_SERVICE_TYPES = [
  SHIPPING_SERVICE_PICKUP_POINT,
  SHIPPING_SERVICE_COURIER,
];

/**
 * Глобальный kill-switch интеграций с перевозчиками.
 * Независимо от PRODUCT_DELIVERY_FULFILLMENT_ENABLED (доставка продавцом).
 */
export const SHIPPING_PROVIDERS_ENABLED = false;

/** Per-provider flags (все false, пока нет живых ключей). */
export const SHIPPING_PROVIDER_ENABLED = {
  [SHIPPING_PROVIDER_CDEK]: false,
  [SHIPPING_PROVIDER_YANDEX_DELIVERY]: false,
  [SHIPPING_PROVIDER_RUSSIAN_POST]: false,
};

/** Первый кандидат на live-подключение. */
export const SHIPPING_PROVIDER_PRIMARY = SHIPPING_PROVIDER_CDEK;

export const SHIPPING_TRACKING_NUMBER_MAX_LENGTH = 64;
export const SHIPPING_TRACKING_URL_MAX_LENGTH = 500;
export const SHIPPING_EXTERNAL_ID_MAX_LENGTH = 128;
export const SHIPPING_CARRIER_STATUS_MAX_LENGTH = 64;

export const SHIPPING_NOT_AVAILABLE_MESSAGE =
  "Доставка через службы пока недоступна";

export const SHIPPING_PROVIDERS_CHECKOUT_SOON_HINT = `Скоро: ${SHIPPING_PROVIDERS.map(
  (id) => SHIPPING_PROVIDER_LABEL_RU[id],
).join(", ")}`;

export const shippingProviderSchema = z.enum(SHIPPING_PROVIDERS);
export const shippingServiceTypeSchema = z.enum(SHIPPING_SERVICE_TYPES);

export const shippingTrackingNumberSchema = z
  .string()
  .trim()
  .min(1)
  .max(SHIPPING_TRACKING_NUMBER_MAX_LENGTH);

export const shippingTrackingUrlSchema = z
  .string()
  .trim()
  .url()
  .max(SHIPPING_TRACKING_URL_MAX_LENGTH);

/**
 * @param {string | null | undefined} providerId
 * @returns {boolean}
 */
export function isShippingProviderLive(providerId) {
  if (!SHIPPING_PROVIDERS_ENABLED) {
    return false;
  }
  if (providerId == null || providerId === "") {
    return false;
  }
  return SHIPPING_PROVIDER_ENABLED[providerId] === true;
}

/**
 * Stub-поля перевозчика на заказе (nullable; заполняются вручную / API позже).
 * Не принимаются в POST /order — только чтение / staff-patch в будущем.
 */
export const orderShippingStubFieldsSchema = z.object({
  shippingProvider: shippingProviderSchema.nullable().optional(),
  shippingServiceType: shippingServiceTypeSchema.nullable().optional(),
  shippingTrackingNumber: z
    .string()
    .trim()
    .max(SHIPPING_TRACKING_NUMBER_MAX_LENGTH)
    .nullable()
    .optional(),
  shippingTrackingUrl: z
    .string()
    .trim()
    .max(SHIPPING_TRACKING_URL_MAX_LENGTH)
    .nullable()
    .optional(),
  shippingExternalId: z
    .string()
    .trim()
    .max(SHIPPING_EXTERNAL_ID_MAX_LENGTH)
    .nullable()
    .optional(),
  shippingCarrierStatus: z
    .string()
    .trim()
    .max(SHIPPING_CARRIER_STATUS_MAX_LENGTH)
    .nullable()
    .optional(),
});

/**
 * Публичный URL трекинга (без API). Яндекс — без стабильного публичного URL.
 * @param {string | null | undefined} provider
 * @param {string | null | undefined} trackingNumber
 * @returns {string | null}
 */
export function buildShippingTrackingUrl(provider, trackingNumber) {
  const code = String(trackingNumber ?? "").trim();
  if (!code) {
    return null;
  }
  switch (provider) {
    case SHIPPING_PROVIDER_CDEK:
      return `https://www.cdek.ru/ru/tracking?order_id=${encodeURIComponent(code)}`;
    case SHIPPING_PROVIDER_RUSSIAN_POST:
      return `https://www.pochta.ru/tracking#${encodeURIComponent(code)}`;
    case SHIPPING_PROVIDER_YANDEX_DELIVERY:
      return null;
    default:
      return null;
  }
}

/**
 * @param {{
 *   shippingTrackingUrl?: string | null;
 *   shippingProvider?: string | null;
 *   shippingTrackingNumber?: string | null;
 * }} order
 * @returns {string | null}
 */
export function resolveOrderShippingTrackingUrl(order) {
  const explicit = String(order?.shippingTrackingUrl ?? "").trim();
  if (explicit) {
    return explicit;
  }
  return buildShippingTrackingUrl(
    order?.shippingProvider,
    order?.shippingTrackingNumber,
  );
}
