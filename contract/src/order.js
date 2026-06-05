import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";

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
    .min(1, "Укажите номер квартиры")
    .max(ORDER_DELIVERY_FLAT_MAX_LENGTH),
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
