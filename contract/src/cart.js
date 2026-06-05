import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";

/** Синхрон с `server/constants/cartConstants.js`. */
export const CART_MAX_DISTINCT_PRODUCTS = 30;
export const CART_LINE_ITEM_QUANTITY_MIN = 1;
export const CART_LINE_ITEM_QUANTITY_MAX = 99;

const cartQuantitySchema = z.coerce
  .number()
  .int()
  .min(CART_LINE_ITEM_QUANTITY_MIN)
  .max(CART_LINE_ITEM_QUANTITY_MAX);

/** `items`: productId → quantity (после парсинга тела). */
export const cartItemsRecordSchema = z
  .record(mongoIdSchema, cartQuantitySchema)
  .refine((items) => Object.keys(items).length <= CART_MAX_DISTINCT_PRODUCTS, {
    message: `Не более ${CART_MAX_DISTINCT_PRODUCTS} разных товаров в корзине`,
  });

/** Тело `PUT /cart`. */
export const replaceCartBodySchema = z.object({
  items: cartItemsRecordSchema,
});

/** `data` ответа `PUT /cart`. */
export const replaceCartDataSchema = z.object({
  items: cartItemsRecordSchema,
});
