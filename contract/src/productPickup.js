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
 * Пока false: UI disabled, сервер отклоняет delivery / productDeliveryEnabled=true.
 */
export const PRODUCT_DELIVERY_FULFILLMENT_ENABLED = false;

export const PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE =
  "Укажите адрес самовывоза";

export const PRODUCT_DELIVERY_NOT_AVAILABLE_MESSAGE =
  "Доставка пока недоступна — выберите самовывоз";

export const PRODUCT_PICKUP_MISSING_FOR_ORDER_MESSAGE =
  "У одного или нескольких товаров нет адреса самовывоза";

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
    /** Игнорируется / отклоняется, пока PRODUCT_DELIVERY_FULFILLMENT_ENABLED=false. */
    productDeliveryEnabled: z.coerce.boolean().optional(),
  })
  .superRefine((body, ctx) => assertPickupCoordsPair(body, ctx));

/** Поля самовывоза для patch (все optional). */
export const productPickupPatchFieldsSchema = z
  .object({
    productPickupAddress: productPickupAddressFieldSchema.optional(),
    productPickupLat: productPickupLatSchema.nullable().optional(),
    productPickupLon: productPickupLonSchema.nullable().optional(),
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
