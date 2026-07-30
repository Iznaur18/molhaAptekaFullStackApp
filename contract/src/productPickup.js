import { z } from "zod";

/** Синхрон с `ORDER_DELIVERY_ADDRESS_MAX_LENGTH` / DaData line. */
export const PRODUCT_PICKUP_ADDRESS_MIN_LENGTH = 5;
export const PRODUCT_PICKUP_ADDRESS_MAX_LENGTH = 100;

export const ORDER_FULFILLMENT_PICKUP = "pickup";
export const ORDER_FULFILLMENT_DELIVERY = "delivery";

/** @type {readonly ["pickup", "delivery"]} */
export const ORDER_FULFILLMENT_METHODS = [
  ORDER_FULFILLMENT_PICKUP,
  ORDER_FULFILLMENT_DELIVERY,
];

/**
 * Когда true — продавец может включить доставку, покупатель выбрать delivery.
 * Перевозчики (СДЭК и т.п.) — отдельно: SHIPPING_PROVIDERS_ENABLED.
 */
export const PRODUCT_DELIVERY_FULFILLMENT_ENABLED = true;

export const PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE =
  "Укажите адрес самовывоза";

export const PRODUCT_DELIVERY_NOT_AVAILABLE_MESSAGE =
  "Доставка пока недоступна — выберите самовывоз";

export const PRODUCT_DELIVERY_NOT_ENABLED_FOR_ITEMS_MESSAGE =
  "Доставка недоступна для одного или нескольких товаров в заказе";

export const PRODUCT_PICKUP_MISSING_FOR_ORDER_MESSAGE =
  "У одного или нескольких товаров нет адреса самовывоза";

export const PRODUCT_PICKUP_NOT_ENABLED_FOR_ITEMS_MESSAGE =
  "Самовывоз недоступен для одного или нескольких товаров в заказе";

export const PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE =
  "Выберите хотя бы один способ: самовывоз или доставку";

export const CART_FULFILLMENT_SECTION_PICKUP = "pickup";
export const CART_FULFILLMENT_SECTION_DELIVERY = "delivery";

/**
 * Секция корзины: dual/pickup → самовывоз; delivery-only → доставка.
 * @param {{ productPickupEnabled?: boolean | null; productDeliveryEnabled?: boolean | null } | null | undefined} product
 * @returns {"pickup" | "delivery"}
 */
export function resolveCartLineFulfillmentSection(product) {
  const pickupOn = product?.productPickupEnabled !== false;
  const deliveryOn = product?.productDeliveryEnabled === true;
  if (!pickupOn && deliveryOn) {
    return CART_FULFILLMENT_SECTION_DELIVERY;
  }
  return CART_FULFILLMENT_SECTION_PICKUP;
}

/**
 * Все товары поддерживают самовывоз (по умолчанию true для старых документов).
 * @param {Array<{ productPickupEnabled?: boolean | null; productPickupAddress?: string | null } | null | undefined>} products
 * @returns {boolean}
 */
export function doProductsSupportPickup(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return false;
  }
  return products.every((product) => {
    if (product?.productPickupEnabled === false) {
      return false;
    }
    return String(product?.productPickupAddress ?? "").trim().length > 0;
  });
}

/**
 * Все товары поддерживают доставку продавцом.
 * @param {Array<{ productDeliveryEnabled?: boolean | null } | null | undefined>} products
 * @returns {boolean}
 */
export function doProductsSupportSellerDelivery(products) {
  if (!PRODUCT_DELIVERY_FULFILLMENT_ENABLED) {
    return false;
  }
  if (!Array.isArray(products) || products.length === 0) {
    return false;
  }
  return products.every((product) => product?.productDeliveryEnabled === true);
}

export const productPickupLatFieldSchema = z.coerce.number().min(-90).max(90);
export const productPickupLonFieldSchema = z.coerce.number().min(-180).max(180);

const productPickupLatSchema = productPickupLatFieldSchema;
const productPickupLonSchema = productPickupLonFieldSchema;

export const productPickupAddressFieldSchema = z
  .string()
  .trim()
  .min(
    PRODUCT_PICKUP_ADDRESS_MIN_LENGTH,
    PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
  )
  .max(
    PRODUCT_PICKUP_ADDRESS_MAX_LENGTH,
    `Адрес самовывоза не длиннее ${PRODUCT_PICKUP_ADDRESS_MAX_LENGTH} символов`,
  );

/**
 * @param {{
 *   productPickupLat?: number | null;
 *   productPickupLon?: number | null;
 * }} body
 * @param {import('zod').RefinementCtx} ctx
 * @param {{ latPath?: (string|number)[]; lonPath?: (string|number)[] }} [paths]
 */
export const assertPickupCoordsPair = (body, ctx, paths = {}) => {
  const lat = body.productPickupLat;
  const lon = body.productPickupLon;
  const hasLat = lat != null && Number.isFinite(Number(lat));
  const hasLon = lon != null && Number.isFinite(Number(lon));
  if (hasLat === hasLon) {
    return;
  }
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: hasLat ? paths.lonPath ?? ["productPickupLon"] : paths.latPath ?? ["productPickupLat"],
    message: "Укажите и широту, и долготу точки самовывоза",
  });
};

/** Поля самовывоза для create (адрес обязателен). */
export const productPickupCreateFieldsSchema = z
  .object({
    productPickupAddress: productPickupAddressFieldSchema,
    productPickupLat: productPickupLatSchema.nullable().optional(),
    productPickupLon: productPickupLonSchema.nullable().optional(),
    /** Самовывоз для покупателя; default true. */
    productPickupEnabled: z.coerce.boolean().optional(),
    /** Доставка продавцом; отклоняется, пока PRODUCT_DELIVERY_FULFILLMENT_ENABLED=false. */
    productDeliveryEnabled: z.coerce.boolean().optional(),
  })
  .superRefine((body, ctx) => {
    assertPickupCoordsPair(body, ctx);
    const pickupOn = body.productPickupEnabled !== false;
    const deliveryOn = body.productDeliveryEnabled === true;
    if (!pickupOn && !deliveryOn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["productPickupEnabled"],
        message: PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE,
      });
    }
  });

/** Поля самовывоза для patch (все optional). */
export const productPickupPatchFieldsSchema = z
  .object({
    productPickupAddress: productPickupAddressFieldSchema.optional(),
    productPickupLat: productPickupLatSchema.nullable().optional(),
    productPickupLon: productPickupLonSchema.nullable().optional(),
    productPickupEnabled: z.coerce.boolean().optional(),
    productDeliveryEnabled: z.coerce.boolean().optional(),
  })
  .superRefine((body, ctx) => {
    if (
      Object.prototype.hasOwnProperty.call(body, "productPickupLat") ||
      Object.prototype.hasOwnProperty.call(body, "productPickupLon")
    ) {
      assertPickupCoordsPair(body, ctx);
    }
  });

export const orderFulfillmentMethodSchema = z.enum(ORDER_FULFILLMENT_METHODS);
