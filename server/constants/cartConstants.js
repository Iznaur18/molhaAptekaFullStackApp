import { ORDER_LINE_ITEM_QUANTITY_MIN } from "./orderConstants.js";

/** Максимум разных товаров (строк) в корзине одного пользователя. */
export const CART_MAX_DISTINCT_PRODUCTS = 30;

/** Минимальное количество по позиции (как в заказе). */
export const CART_LINE_ITEM_QUANTITY_MIN = ORDER_LINE_ITEM_QUANTITY_MIN;

/** Максимальное количество единиц одного товара в корзине. */
export const CART_LINE_ITEM_QUANTITY_MAX = 99;
