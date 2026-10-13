import { z } from "zod";

import {
  CATEGORY_DEAL_TYPE_SERVICE,
  CATEGORY_DEAL_TYPE_VIEWING,
  normalizeCategoryDealType,
} from "./categoryDealType.js";

/**
 * Условия сделки в объявлении без корзины.
 *
 * У товара цена — число за штуку, и этого хватает. Услугу так не описать:
 * «от 1 500 ₽ за час» и «договорная» — обычное дело, а где её оказывают,
 * покупателю важнее доставки. У осмотра свой вопрос — когда можно приехать.
 */
export const PRODUCT_SERVICE_PRICE_MODE_FIXED = "fixed";
export const PRODUCT_SERVICE_PRICE_MODE_FROM = "from";
export const PRODUCT_SERVICE_PRICE_MODE_NEGOTIABLE = "negotiable";

/** @type {readonly ["fixed", "from", "negotiable"]} */
export const PRODUCT_SERVICE_PRICE_MODES = [
  PRODUCT_SERVICE_PRICE_MODE_FIXED,
  PRODUCT_SERVICE_PRICE_MODE_FROM,
  PRODUCT_SERVICE_PRICE_MODE_NEGOTIABLE,
];
export const PRODUCT_SERVICE_PRICE_MODE_DEFAULT = PRODUCT_SERVICE_PRICE_MODE_FIXED;

export const PRODUCT_SERVICE_PRICE_MODE_LABELS_RU = Object.freeze({
  [PRODUCT_SERVICE_PRICE_MODE_FIXED]: "Точная цена",
  [PRODUCT_SERVICE_PRICE_MODE_FROM]: "От этой суммы",
  [PRODUCT_SERVICE_PRICE_MODE_NEGOTIABLE]: "Договорная",
});

export const PRODUCT_SERVICE_PRICE_UNIT_SERVICE = "service";
export const PRODUCT_SERVICE_PRICE_UNIT_HOUR = "hour";
export const PRODUCT_SERVICE_PRICE_UNIT_SQM = "sqm";

/** @type {readonly ["service", "hour", "sqm"]} */
export const PRODUCT_SERVICE_PRICE_UNITS = [
  PRODUCT_SERVICE_PRICE_UNIT_SERVICE,
  PRODUCT_SERVICE_PRICE_UNIT_HOUR,
  PRODUCT_SERVICE_PRICE_UNIT_SQM,
];
export const PRODUCT_SERVICE_PRICE_UNIT_DEFAULT = PRODUCT_SERVICE_PRICE_UNIT_SERVICE;

export const PRODUCT_SERVICE_PRICE_UNIT_LABELS_RU = Object.freeze({
  [PRODUCT_SERVICE_PRICE_UNIT_SERVICE]: "За услугу",
  [PRODUCT_SERVICE_PRICE_UNIT_HOUR]: "За час",
  [PRODUCT_SERVICE_PRICE_UNIT_SQM]: "За м²",
});

/** Хвост к цене: «1 500 ₽ / час». У «за услугу» хвоста нет. */
const PRICE_UNIT_SUFFIX_RU = Object.freeze({
  [PRODUCT_SERVICE_PRICE_UNIT_SERVICE]: "",
  [PRODUCT_SERVICE_PRICE_UNIT_HOUR]: " / час",
  [PRODUCT_SERVICE_PRICE_UNIT_SQM]: " / м²",
});

export const PRODUCT_SERVICE_PRICE_NEGOTIABLE_LABEL = "Договорная";

export const PRODUCT_SERVICE_LOCATION_AT_CLIENT = "at_client";
export const PRODUCT_SERVICE_LOCATION_AT_PROVIDER = "at_provider";
export const PRODUCT_SERVICE_LOCATION_ONLINE = "online";

/** @type {readonly ["at_client", "at_provider", "online"]} */
export const PRODUCT_SERVICE_LOCATIONS = [
  PRODUCT_SERVICE_LOCATION_AT_CLIENT,
  PRODUCT_SERVICE_LOCATION_AT_PROVIDER,
  PRODUCT_SERVICE_LOCATION_ONLINE,
];

export const PRODUCT_SERVICE_LOCATION_LABELS_RU = Object.freeze({
  [PRODUCT_SERVICE_LOCATION_AT_CLIENT]: "Выезд к клиенту",
  [PRODUCT_SERVICE_LOCATION_AT_PROVIDER]: "У исполнителя",
  [PRODUCT_SERVICE_LOCATION_ONLINE]: "Онлайн",
});

export const PRODUCT_VIEWING_SCHEDULE_MAX_LENGTH = 200;

export const productServicePriceModeSchema = z.enum(PRODUCT_SERVICE_PRICE_MODES);
export const productServicePriceUnitSchema = z.enum(PRODUCT_SERVICE_PRICE_UNITS);
export const productServiceLocationsSchema = z
  .array(z.enum(PRODUCT_SERVICE_LOCATIONS))
  .max(PRODUCT_SERVICE_LOCATIONS.length)
  .transform((values) => [...new Set(values)]);
export const productViewingScheduleSchema = z
  .string()
  .trim()
  .max(
    PRODUCT_VIEWING_SCHEDULE_MAX_LENGTH,
    `Не длиннее ${PRODUCT_VIEWING_SCHEDULE_MAX_LENGTH} символов`,
  );

/**
 * Поля условий сделки для схем создания и правки товара.
 *
 * Все необязательные: у обычного товара их нет вовсе, а объявление, созданное
 * до их появления, читается с дефолтами.
 */
export const productDealTermsFieldsShape = {
  productServicePriceMode: productServicePriceModeSchema.optional(),
  productServicePriceUnit: productServicePriceUnitSchema.optional(),
  productServiceLocations: productServiceLocationsSchema.optional(),
  productViewingSchedule: productViewingScheduleSchema.optional(),
};

/**
 * @param {unknown} raw
 * @returns {"fixed" | "from" | "negotiable"}
 */
export const normalizeProductServicePriceMode = (raw) =>
  PRODUCT_SERVICE_PRICE_MODES.includes(/** @type {any} */ (raw))
    ? /** @type {"fixed" | "from" | "negotiable"} */ (raw)
    : PRODUCT_SERVICE_PRICE_MODE_DEFAULT;

/**
 * @param {unknown} raw
 * @returns {"service" | "hour" | "sqm"}
 */
export const normalizeProductServicePriceUnit = (raw) =>
  PRODUCT_SERVICE_PRICE_UNITS.includes(/** @type {any} */ (raw))
    ? /** @type {"service" | "hour" | "sqm"} */ (raw)
    : PRODUCT_SERVICE_PRICE_UNIT_DEFAULT;

/**
 * Незнакомые значения выкидываются, порядок — как в справочнике.
 *
 * @param {unknown} raw
 * @returns {Array<"at_client" | "at_provider" | "online">}
 */
export const normalizeProductServiceLocations = (raw) => {
  const picked = new Set(Array.isArray(raw) ? raw : []);
  return PRODUCT_SERVICE_LOCATIONS.filter((value) => picked.has(value));
};

/**
 * Как показать цену объявления-услуги: «от 1 500 ₽ / час» или «Договорная».
 *
 * Для всего, что не услуга, возвращает цену как есть — вызывать можно для
 * любого товара, не проверяя тип заранее.
 *
 * @param {{
 *   productDealType?: unknown;
 *   productServicePriceMode?: unknown;
 *   productServicePriceUnit?: unknown;
 * } | null | undefined} product
 * @param {string} formattedPrice цена, уже отформатированная клиентом («1 500 ₽»)
 */
export const formatProductDealPrice = (product, formattedPrice) => {
  if (
    normalizeCategoryDealType(product?.productDealType) !== CATEGORY_DEAL_TYPE_SERVICE
  ) {
    return formattedPrice;
  }
  const mode = normalizeProductServicePriceMode(product?.productServicePriceMode);
  if (mode === PRODUCT_SERVICE_PRICE_MODE_NEGOTIABLE) {
    return PRODUCT_SERVICE_PRICE_NEGOTIABLE_LABEL;
  }
  const unit = normalizeProductServicePriceUnit(product?.productServicePriceUnit);
  const prefix = mode === PRODUCT_SERVICE_PRICE_MODE_FROM ? "от " : "";
  return `${prefix}${formattedPrice}${PRICE_UNIT_SUFFIX_RU[unit]}`;
};

/**
 * Знает ли покупатель итоговую цену заранее. Если нет — исполнитель называет
 * её сам, принимая заявку, и подставлять число из объявления нельзя.
 *
 * @param {{ productServicePriceMode?: unknown } | null | undefined} product
 */
export const isProductServicePriceFixed = (product) =>
  normalizeProductServicePriceMode(product?.productServicePriceMode) ===
  PRODUCT_SERVICE_PRICE_MODE_FIXED;

/**
 * Есть ли у объявления условия осмотра (расписание) для показа покупателю.
 *
 * @param {{ productDealType?: unknown; productViewingSchedule?: unknown } | null | undefined} product
 */
export const resolveProductViewingSchedule = (product) =>
  normalizeCategoryDealType(product?.productDealType) === CATEGORY_DEAL_TYPE_VIEWING
    ? String(product?.productViewingSchedule ?? "").trim()
    : "";
