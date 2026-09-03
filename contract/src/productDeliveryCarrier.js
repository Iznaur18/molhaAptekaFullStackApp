import { z } from "zod";

import {
  SHIPPING_PROVIDER_LOBO,
  isShippingProviderAvailableInRegion,
  isShippingProviderLive,
} from "./shippingProvider.js";

/**
 * Кто везёт товар до покупателя.
 *
 * До появления ЛОБО перевозчик кодировался двумя булевыми флагами
 * (`productDeliveryEnabled` / `productCourierDeliveryEnabled`), и третий
 * вариант в них просто не помещался. Теперь источник правды — одно поле, а
 * флаги остаются производными: их читает много старого кода, и ломать его
 * ради переименования незачем.
 */
export const PRODUCT_DELIVERY_CARRIER_SELLER = "seller";
export const PRODUCT_DELIVERY_CARRIER_GITORG = "gitorg_courier";
export const PRODUCT_DELIVERY_CARRIER_LOBO = SHIPPING_PROVIDER_LOBO;

/** @type {readonly ["seller", "gitorg_courier", "lobo"]} */
export const PRODUCT_DELIVERY_CARRIERS = [
  PRODUCT_DELIVERY_CARRIER_SELLER,
  PRODUCT_DELIVERY_CARRIER_GITORG,
  PRODUCT_DELIVERY_CARRIER_LOBO,
];

export const PRODUCT_DELIVERY_CARRIER_LABEL_RU = {
  [PRODUCT_DELIVERY_CARRIER_SELLER]: "Доставка продавцом",
  [PRODUCT_DELIVERY_CARRIER_GITORG]: "Курьеры Gitorg",
  [PRODUCT_DELIVERY_CARRIER_LOBO]: "ЛОБО",
};

/** Перевозчики, привязанные к региону продавца. */
const REGIONAL_CARRIERS = new Set([PRODUCT_DELIVERY_CARRIER_LOBO]);

export const productDeliveryCarrierSchema = z.enum(PRODUCT_DELIVERY_CARRIERS);

/**
 * То же для записи товара, плюс пустая строка — «доставки нет, только
 * самовывоз». Без неё продавец не мог убрать ранее выбранную службу: поле
 * просто не проходило проверку, и товар оставался «едущим к покупателю».
 */
export const productDeliveryCarrierWriteSchema = z.union([
  productDeliveryCarrierSchema,
  z.literal(""),
]);

/**
 * Кто везёт этот товар. `null` — доставки нет, только самовывоз.
 *
 * @param {{
 *   productDeliveryCarrier?: string | null;
 *   productDeliveryEnabled?: boolean | null;
 *   productCourierDeliveryEnabled?: boolean | null;
 * } | null | undefined} product
 * @returns {string | null}
 */
export function resolveProductDeliveryCarrier(product) {
  const explicit = String(product?.productDeliveryCarrier ?? "").trim();
  if (PRODUCT_DELIVERY_CARRIERS.includes(explicit)) {
    return explicit;
  }
  // Товары, созданные до появления поля, опознаём по старым флагам.
  if (product?.productCourierDeliveryEnabled === true) {
    return PRODUCT_DELIVERY_CARRIER_GITORG;
  }
  if (product?.productDeliveryEnabled === true) {
    return PRODUCT_DELIVERY_CARRIER_SELLER;
  }
  return null;
}

/**
 * Едет ли товар до покупателя вообще — любым перевозчиком.
 *
 * @param {Parameters<typeof resolveProductDeliveryCarrier>[0]} product
 * @returns {boolean}
 */
export function productShipsToBuyer(product) {
  return resolveProductDeliveryCarrier(product) !== null;
}

/**
 * Старые флаги по перевозчику: их читает существующий код.
 *
 * @param {string | null | undefined} carrier
 * @returns {{ productDeliveryEnabled: boolean; productCourierDeliveryEnabled: boolean }}
 */
export function buildLegacyDeliveryFlags(carrier) {
  return {
    productDeliveryEnabled: carrier === PRODUCT_DELIVERY_CARRIER_SELLER,
    productCourierDeliveryEnabled: carrier === PRODUCT_DELIVERY_CARRIER_GITORG,
  };
}

/**
 * Доступен ли перевозчик продавцу из этого региона.
 *
 * Локальные службы предлагаем только там, где они возят; остальные — везде.
 *
 * @param {string | null | undefined} carrier
 * @param {string | null | undefined} regionCode
 * @returns {boolean}
 */
export function isDeliveryCarrierAvailableInRegion(carrier, regionCode) {
  if (!PRODUCT_DELIVERY_CARRIERS.includes(String(carrier ?? ""))) {
    return false;
  }
  if (!REGIONAL_CARRIERS.has(carrier)) {
    return true;
  }
  return (
    isShippingProviderLive(carrier) &&
    isShippingProviderAvailableInRegion(carrier, regionCode)
  );
}

/**
 * Перевозчики, которых продавец из этого региона может выбрать.
 *
 * @param {string | null | undefined} regionCode
 * @returns {string[]}
 */
export function listDeliveryCarriersForRegion(regionCode) {
  return PRODUCT_DELIVERY_CARRIERS.filter((carrier) =>
    isDeliveryCarrierAvailableInRegion(carrier, regionCode),
  );
}
