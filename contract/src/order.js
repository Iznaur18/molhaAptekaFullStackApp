import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";
import {
  optionalLimitQuery,
  optionalPageQuery,
  optionalTrimmedString,
} from "./queryHelpers.js";
import {
  ORDER_FULFILLMENT_PICKUP,
  orderFulfillmentMethodSchema,
} from "./productPickup.js";
import { PRODUCT_PICKUP_LOCATION_ID_MAX_LENGTH } from "./productPickupLocations.js";

/** Синхрон с `server/constants/orderConstants.js`. */
export const ORDER_PAYMENT_METHODS = ["cashOnDelivery", "cardPrepaid"];
export const ORDER_STATUSES = [
  "pending",
  "accepted",
  "assembling",
  "ready_for_pickup",
  "ready_to_ship",
  "courier_assigned",
  "courier_holding",
  "in_delivery",
  "confirmed",
  "shipped",
  "delivered",
  "returned",
  "cancelled",
];

/**
 * Ступени, на которые продавец двигает своё отправление вручную.
 *
 * Отдельно от `ORDER_STATUSES`: остальные значения ставит система или другие
 * участники, и принимать их в теле запроса нельзя.
 */
export const ORDER_SHIPMENT_ADVANCE_STATUSES = [
  "accepted",
  "assembling",
  "ready_for_pickup",
  "ready_to_ship",
];
export const ORDER_LINE_ITEM_QUANTITY_MIN = 1;
export const ORDER_ITEMS_MAX = 100;

/** Синхрон с `server/constants/dadataConstants.js`. */
export const ORDER_DELIVERY_ADDRESS_MAX_LENGTH = 100;
export const ORDER_DELIVERY_FLAT_MAX_LENGTH = 20;

const orderLineItemInputSchema = z.object({
  productId: mongoIdSchema,
  quantity: z.coerce.number().int().min(ORDER_LINE_ITEM_QUANTITY_MIN).max(999),
});

const orderPickupSelectionSchema = z.object({
  productId: mongoIdSchema,
  pickupLocationId: z.string().trim().min(1).max(PRODUCT_PICKUP_LOCATION_ID_MAX_LENGTH),
});

/** Тело `POST /order` (структура; DaData — отдельно на сервере для delivery). */
export const createOrderBodySchema = z
  .object({
    items: z.array(orderLineItemInputSchema).min(1).max(ORDER_ITEMS_MAX),
    fulfillmentMethod: orderFulfillmentMethodSchema
      .optional()
      .default(ORDER_FULFILLMENT_PICKUP),
    deliveryAddress: z
      .string()
      .trim()
      .max(ORDER_DELIVERY_ADDRESS_MAX_LENGTH)
      .optional()
      .default(""),
    deliveryAddressFlat: z
      .string()
      .trim()
      .max(ORDER_DELIVERY_FLAT_MAX_LENGTH)
      .optional()
      .default(""),
    /**
     * Способ получения на продавца — заказ распадается на отправления, и у
     * каждого свой способ. Чего покупатель не прислал, берётся из общего
     * `fulfillmentMethod`, поэтому старые клиенты работают без изменений.
     */
    fulfillmentBySellerId: z
      .record(z.enum(["pickup", "delivery"]))
      .optional()
      .default({}),
    /** Выбор точки самовывоза на товар (при ≥2 точках у товара). */
    pickupSelections: z
      .array(orderPickupSelectionSchema)
      .max(ORDER_ITEMS_MAX)
      .optional()
      .default([]),
    paymentMethod: z.enum(ORDER_PAYMENT_METHODS),
    priceOfferId: mongoIdSchema.optional(),
    /** Код шарера (`referralCode`) из `?aff=` — last-click attribution. */
    affiliateCode: z.string().trim().toUpperCase().max(32).optional(),
    idempotencyKey: z
      .string({ required_error: "Укажите idempotencyKey" })
      .trim()
      .min(1, "Укажите idempotencyKey")
      .max(64),
  })
  .superRefine((body, ctx) => {
    // Одна строка на товар. Дубликаты productId ломали снапшот buy-N-free
    // (одна claim'ленная бесплатная единица применялась к каждой строке),
    // а также размывали оптовые пороги. Клиенты всегда шлют корзину,
    // сгруппированную по productId.
    const seenProductIds = new Set();
    for (const [index, item] of body.items.entries()) {
      const productId = String(item.productId);
      if (seenProductIds.has(productId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "productId"],
          message:
            "Товар указан в заказе дважды — объедините количество в одну позицию",
        });
      }
      seenProductIds.add(productId);
    }

    const seenPickupProductIds = new Set();
    for (const [index, row] of (body.pickupSelections ?? []).entries()) {
      const productId = String(row.productId);
      if (seenPickupProductIds.has(productId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pickupSelections", index, "productId"],
          message: "Для товара указано несколько точек самовывоза",
        });
      }
      seenPickupProductIds.add(productId);
    }

    // Адрес нужен, как только хоть одно отправление едет к покупателю —
    // даже если общий способ заказа остался самовывозом.
    const anySellerDelivery = Object.values(body.fulfillmentBySellerId ?? {}).some(
      (method) => method === "delivery",
    );
    if (body.fulfillmentMethod === "delivery" || anySellerDelivery) {
      const line = String(body.deliveryAddress ?? "").trim();
      if (!line) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["deliveryAddress"],
          message: "Адрес доставки обязателен",
        });
      }
    }
  });

export const orderLineItemSchema = z
  .object({
    _id: z.string().optional(),
    productId: z.unknown(),
    quantity: z.number(),
    unitPriceAtOrder: z.number().optional(),
    productNameAtOrder: z.string().optional(),
    status: z.enum(ORDER_STATUSES).optional(),
  })
  .passthrough();

export const orderFromApiSchema = z
  .object({
    _id: z.string(),
    items: z.array(orderLineItemSchema),
    totalAmount: z.number(),
    deliveryAddress: z.string(),
    paymentMethod: z.enum(ORDER_PAYMENT_METHODS),
    status: z.enum(ORDER_STATUSES),
    fulfillmentMethod: z.enum(["pickup", "delivery"]).optional(),
    /** Отправления заказа — по одному на продавца. */
    shipments: z
      .array(
        z.object({
          sellerId: z.string(),
          fulfillmentMethod: z.enum(["pickup", "delivery"]),
        }),
      )
      .optional(),
    shippingProvider: z.string().nullable().optional(),
    shippingServiceType: z.string().nullable().optional(),
    shippingTrackingNumber: z.string().nullable().optional(),
    shippingTrackingUrl: z.string().nullable().optional(),
    shippingExternalId: z.string().nullable().optional(),
    shippingCarrierStatus: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

/** `data` ответа `POST /order`. */
export const createOrderDataSchema = z.object({
  message: z.string(),
  order: orderFromApiSchema,
});

export const orderIdParamsSchema = z.object({
  orderId: mongoIdSchema,
});

export const orderItemActionParamsSchema = z.object({
  orderId: mongoIdSchema,
  itemIndex: z.coerce.number().int().min(0, "itemIndex должен быть целым числом >= 0"),
});

/** Body `PATCH /order/:orderId/shipment/status` — продавец двигает своё отправление. */
export const advanceShipmentStatusBodySchema = z.object({
  nextStatus: z.enum(ORDER_SHIPMENT_ADVANCE_STATUSES),
});

/** Синхрон с `server/models/InstallmentContractModel.js` — `cancellationReason.maxlength`. */
export const ORDER_ITEM_CANCELLATION_REASON_MAX_LENGTH = 2000;

/** Body `PATCH /order/:orderId/items/:itemIndex/cancelled` (рассрочка — причина отмены). */
export const orderItemCancelBodySchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(1, "Причина отмены не может быть пустой")
      .max(
        ORDER_ITEM_CANCELLATION_REASON_MAX_LENGTH,
        `Причина отмены не более ${ORDER_ITEM_CANCELLATION_REASON_MAX_LENGTH} символов`,
      )
      .optional(),
  })
  .default({});

export const updateOrderStatusBodySchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

/** Query `GET /order/all`. */
export const getAllOrdersQuerySchema = z.object({
  page: optionalPageQuery,
  limit: optionalLimitQuery,
  status: z.enum(ORDER_STATUSES).optional(),
});

/** Query `GET /order` (мои заказы). */
export const getMyOrdersQuerySchema = z.object({
  page: optionalPageQuery,
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

/** Синхрон с `server/validations/order/getMySalesValidation.js`. */
export const MY_SALES_SEARCH_MAX_LENGTH = 100;
export const MY_SALES_PRODUCT_IDS_QUERY_MAX_LENGTH = 2800;
export const MY_SALES_MAX_PRODUCT_IDS_IN_FILTER = 50;

/** Query `GET /order/sales`. */
export const getMySalesQuerySchema = z.object({
  page: optionalPageQuery,
  limit: optionalLimitQuery,
  status: z.enum(ORDER_STATUSES).optional(),
  search: optionalTrimmedString.refine(
    (value) => value === undefined || value.length <= MY_SALES_SEARCH_MAX_LENGTH,
    `search не более ${MY_SALES_SEARCH_MAX_LENGTH} символов`,
  ),
  productIds: optionalTrimmedString
    .refine(
      (value) =>
        value === undefined || value.length <= MY_SALES_PRODUCT_IDS_QUERY_MAX_LENGTH,
      `productIds не длиннее ${MY_SALES_PRODUCT_IDS_QUERY_MAX_LENGTH} символов`,
    )
    .superRefine((value, ctx) => {
      if (value === undefined) return;
      const parts = value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length > MY_SALES_MAX_PRODUCT_IDS_IN_FILTER) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `не более ${MY_SALES_MAX_PRODUCT_IDS_IN_FILTER} товаров в фильтре`,
        });
        return;
      }
      for (const id of parts) {
        if (!/^[a-f\d]{24}$/i.test(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "неверный идентификатор товара в productIds",
          });
          return;
        }
      }
    }),
});
