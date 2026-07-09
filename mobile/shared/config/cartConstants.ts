/** Синхрон с `contract/src/cart.js` / `server/constants/cartConstants.js`. */
export const CART_MAX_DISTINCT_PRODUCTS = 30;
export const CART_LINE_ITEM_QUANTITY_MIN = 1;
export const CART_LINE_ITEM_QUANTITY_MAX = 99;

/** Показываем «Осталось N шт», если остаток не больше порога. */
export const CART_LOW_STOCK_WARNING_THRESHOLD = 10;

/** Превью товара в строке корзины (Ozon-like). */
export const CART_LINE_IMAGE_SIZE = 72;

/** Сквиркл-радиус карточки строки корзины. */
export const CART_LINE_CARD_BORDER_RADIUS = 14;
