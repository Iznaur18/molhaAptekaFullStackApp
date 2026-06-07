import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";
import { optionalLimitQuery, optionalPageQuery, optionalTrimmedString } from "./queryHelpers.js";

/** Синхрон с `server/constants/orderConstants.js`. */
export const ORDER_PAYMENT_METHODS = ["cashOnDelivery", "cardPrepaid"];
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
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

/** Тело `POST /order` (структура; DaData — отдельно на сервере). */
export const createOrderBodySchema = z.object({
  items: z.array(orderLineItemInputSchema).min(1).max(ORDER_ITEMS_MAX),
  deliveryAddress: z
    .string()
    .trim()
    .min(1, "Адрес доставки обязателен")
    .max(ORDER_DELIVERY_ADDRESS_MAX_LENGTH),
  deliveryAddressFlat: z
    .string()
    .trim()
    .max(ORDER_DELIVERY_FLAT_MAX_LENGTH)
    .optional()
    .default(""),
  paymentMethod: z.enum(ORDER_PAYMENT_METHODS),
  priceOfferId: mongoIdSchema.optional(),
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

export const updateOrderStatusBodySchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

/** Query `GET /order/all`. */
export const getAllOrdersQuerySchema = z.object({
  page: optionalPageQuery,
  limit: optionalLimitQuery,
  status: z.enum(ORDER_STATUSES).optional(),
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
      (value) => value === undefined || value.length <= MY_SALES_PRODUCT_IDS_QUERY_MAX_LENGTH,
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
