import { z } from "zod";

import { PRODUCT_DELIVERY_CARRIER_GITORG } from "./productDeliveryCarrier.js";
import {
  SHIPPING_PROVIDER_CDEK,
  SHIPPING_PROVIDER_LOBO,
  SHIPPING_PROVIDER_RUSSIAN_POST,
  SHIPPING_PROVIDER_YANDEX_DELIVERY,
} from "./shippingProvider.js";
import { SHIPPING_PROVIDER_YANDEX_EXPRESS } from "./yandexDelivery.js";

/**
 * Справка о службе доставки: что это, когда работает, куда звонить.
 *
 * Ни одна из служб не отдаёт это по API: у СДЭК и Яндекса есть график только
 * отдельного пункта выдачи, у ЛОБО — только заказы. Поэтому текст заполняет
 * админ, а клиенты показывают его по кнопке «!» рядом со службой.
 *
 * «Доставки продавцом» здесь нет: у неё нет общей горячей линии и графика.
 */
export const SHIPPING_CARRIER_INFO_IDS = [
  PRODUCT_DELIVERY_CARRIER_GITORG,
  SHIPPING_PROVIDER_LOBO,
  SHIPPING_PROVIDER_CDEK,
  SHIPPING_PROVIDER_YANDEX_DELIVERY,
  SHIPPING_PROVIDER_YANDEX_EXPRESS,
  SHIPPING_PROVIDER_RUSSIAN_POST,
];

export const SHIPPING_CARRIER_INFO_LABEL_RU = {
  [PRODUCT_DELIVERY_CARRIER_GITORG]: "Курьеры Gitorg",
  [SHIPPING_PROVIDER_LOBO]: "ЛОБО",
  [SHIPPING_PROVIDER_CDEK]: "СДЭК",
  [SHIPPING_PROVIDER_YANDEX_DELIVERY]: "Яндекс Доставка",
  [SHIPPING_PROVIDER_YANDEX_EXPRESS]: "Яндекс Экспресс",
  [SHIPPING_PROVIDER_RUSSIAN_POST]: "Почта России",
};

export const SHIPPING_CARRIER_INFO_DESCRIPTION_MAX_LENGTH = 600;
export const SHIPPING_CARRIER_INFO_WORK_HOURS_MAX_LENGTH = 200;
export const SHIPPING_CARRIER_INFO_COVERAGE_MAX_LENGTH = 200;
export const SHIPPING_CARRIER_INFO_PHONE_MAX_LENGTH = 32;
export const SHIPPING_CARRIER_INFO_WEBSITE_MAX_LENGTH = 200;

/** Поля справки в порядке показа. */
export const SHIPPING_CARRIER_INFO_FIELDS = [
  "description",
  "workHours",
  "coverage",
  "phone",
  "website",
];

export const shippingCarrierInfoIdSchema = z.enum(SHIPPING_CARRIER_INFO_IDS);

const phoneSchema = z
  .string()
  .trim()
  .max(SHIPPING_CARRIER_INFO_PHONE_MAX_LENGTH)
  .refine((value) => value === "" || /^\+?[\d\s()-]{5,}$/u.test(value), {
    message: "Телефон: только цифры, пробелы, скобки, «+» и «-»",
  });

const websiteSchema = z
  .string()
  .trim()
  .max(SHIPPING_CARRIER_INFO_WEBSITE_MAX_LENGTH)
  .refine((value) => value === "" || /^https?:\/\/\S+\.\S+$/iu.test(value), {
    message: "Сайт: ссылка должна начинаться с http:// или https://",
  });

/** Body `PUT /staff/shipping-carriers/:carrierId/info`. Пустая строка — поля нет. */
export const shippingCarrierInfoBodySchema = z.object({
  description: z
    .string()
    .trim()
    .max(SHIPPING_CARRIER_INFO_DESCRIPTION_MAX_LENGTH)
    .default(""),
  workHours: z
    .string()
    .trim()
    .max(SHIPPING_CARRIER_INFO_WORK_HOURS_MAX_LENGTH)
    .default(""),
  coverage: z
    .string()
    .trim()
    .max(SHIPPING_CARRIER_INFO_COVERAGE_MAX_LENGTH)
    .default(""),
  phone: phoneSchema.default(""),
  website: websiteSchema.default(""),
});

/** Params `PUT /staff/shipping-carriers/:carrierId/info`. */
export const shippingCarrierInfoParamsSchema = z.object({
  carrierId: shippingCarrierInfoIdSchema,
});

export const shippingCarrierInfoSchema = z.object({
  carrierId: z.string(),
  label: z.string(),
  description: z.string(),
  workHours: z.string(),
  coverage: z.string(),
  phone: z.string(),
  website: z.string(),
});

/** `data` ответов `GET /order/shipping-carriers/info` и staff-ручек. */
export const shippingCarrierInfoListDataSchema = z.object({
  items: z.array(shippingCarrierInfoSchema),
});

/**
 * Есть ли что показать. Пустую справку клиент не показывает вовсе — кнопки «!»
 * у такой службы нет.
 *
 * @param {Record<string, unknown> | null | undefined} info
 * @returns {boolean}
 */
export function hasShippingCarrierInfo(info) {
  return SHIPPING_CARRIER_INFO_FIELDS.some(
    (field) => String(info?.[field] ?? "").trim() !== "",
  );
}

/**
 * `tel:`-ссылка из телефона справки; `null`, если звонить некуда.
 *
 * @param {string | null | undefined} phone
 * @returns {string | null}
 */
export function buildShippingCarrierInfoTelHref(phone) {
  const raw = String(phone ?? "").trim();
  const digits = raw.replace(/\D/gu, "");
  if (!digits) return null;
  return `tel:${raw.startsWith("+") ? "+" : ""}${digits}`;
}
