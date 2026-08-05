/** SSOT: `contract/src/productWrite.js`. */
import {
  PRODUCT_STOCK_QUANTITY_MIN,
  PRODUCT_STOCK_QUANTITY_MAX,
} from "@molha/api-contract";

export { PRODUCT_STOCK_QUANTITY_MIN, PRODUCT_STOCK_QUANTITY_MAX };

export const PRODUCT_STOCK_SHOW_REMAINING_THRESHOLD = 10;

export const PRODUCT_STOCK_INSUFFICIENT_MESSAGE = "Недостаточно товара в наличии";
export const PRODUCT_STOCK_PATCH_BELOW_RESERVED_MESSAGE =
  "Нельзя указать остаток меньше зарезервированного в заказах";
export const PRODUCT_STOCK_PATCH_INVALID_MESSAGE = `Количество от ${PRODUCT_STOCK_QUANTITY_MIN} до ${PRODUCT_STOCK_QUANTITY_MAX}`;
export const PRODUCT_STOCK_REQUIRED_WHEN_AVAILABLE_MESSAGE =
  `Укажите количество в наличии (от ${PRODUCT_STOCK_QUANTITY_MIN} до ${PRODUCT_STOCK_QUANTITY_MAX})`;
