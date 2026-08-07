import { z } from "zod";

/** Синхрон с `PRODUCT_PRICE_RUB_MAX` в productWrite (без циклического import). */
export const PRODUCT_RENTAL_PRICE_RUB_MAX = 999_999_999;

export const PRODUCT_RENTAL_PRICE_UNIT_HOUR = "hour";
export const PRODUCT_RENTAL_PRICE_UNIT_DAY = "day";

/** @type {readonly ["hour", "day"]} */
export const PRODUCT_RENTAL_PRICE_UNIT_VALUES = [
  PRODUCT_RENTAL_PRICE_UNIT_HOUR,
  PRODUCT_RENTAL_PRICE_UNIT_DAY,
];

export const PRODUCT_RENTAL_PRICE_UNIT_DEFAULT = PRODUCT_RENTAL_PRICE_UNIT_DAY;

export const PRODUCT_RENTAL_CONFIG_REQUIRED_MESSAGE =
  "Сначала укажите цену аренды и единицу (час или сутки)";
export const PRODUCT_RENTAL_PRICE_REQUIRED_MESSAGE =
  "Цена аренды должна быть больше 0";
export const PRODUCT_RENTAL_UNIT_INVALID_MESSAGE =
  "Выберите единицу цены: час или сутки";

export const productRentalPriceUnitSchema = z.enum(PRODUCT_RENTAL_PRICE_UNIT_VALUES);

export const productRentalPriceRubFieldSchema = z.coerce
  .number()
  .int()
  .min(1, PRODUCT_RENTAL_PRICE_REQUIRED_MESSAGE)
  .max(PRODUCT_RENTAL_PRICE_RUB_MAX);

export const productRentalPatchFieldsShape = {
  productRentalEnabled: z.coerce.boolean().optional(),
  productRentalPriceRub: productRentalPriceRubFieldSchema.optional(),
  productRentalPriceUnit: productRentalPriceUnitSchema.optional(),
};
