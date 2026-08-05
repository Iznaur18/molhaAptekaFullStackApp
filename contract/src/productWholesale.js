import { z } from "zod";

/** Синхрон с `PRODUCT_PRICE_RUB_MAX` (productWrite). */
export const PRODUCT_WHOLESALE_MIN_QTY_MIN = 2;
export const PRODUCT_WHOLESALE_MIN_QTY_MAX = 9999;
export const PRODUCT_WHOLESALE_PRICE_RUB_MAX = 999_999_999;

export const PRODUCT_WHOLESALE_CONFIG_REQUIRED_MESSAGE =
  "Сначала укажите оптовую цену и количество";
export const PRODUCT_WHOLESALE_PRICE_MUST_BE_LOWER_MESSAGE =
  "Оптовая цена должна быть меньше обычной";
export const PRODUCT_WHOLESALE_MIN_QTY_MESSAGE = `Минимум ${PRODUCT_WHOLESALE_MIN_QTY_MIN} шт. для оптовой цены`;

export const productWholesaleMinQtyFieldSchema = z.coerce
  .number()
  .int()
  .min(PRODUCT_WHOLESALE_MIN_QTY_MIN, PRODUCT_WHOLESALE_MIN_QTY_MESSAGE)
  .max(PRODUCT_WHOLESALE_MIN_QTY_MAX);

export const productWholesalePriceFieldSchema = z.coerce
  .number()
  .int()
  .min(1, "Оптовая цена должна быть больше 0")
  .max(PRODUCT_WHOLESALE_PRICE_RUB_MAX);

export const productWholesalePatchFieldsShape = {
  productWholesaleEnabled: z.coerce.boolean().optional(),
  productWholesaleMinQty: productWholesaleMinQtyFieldSchema.optional(),
  productWholesalePrice: productWholesalePriceFieldSchema.optional(),
};
