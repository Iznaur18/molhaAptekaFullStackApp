/** Способы оплаты — совпадают с `enum` в `server/constants/orderConstants.js`. */
export const ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY = "cashOnDelivery";
export const ORDER_PAYMENT_METHOD_CARD_PREPAID = "cardPrepaid";

export const ORDER_PAYMENT_METHODS = [
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
];

export const ORDER_PAYMENT_METHOD_LABEL_RU = {
  [ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY]: "Наличными при получении",
  [ORDER_PAYMENT_METHOD_CARD_PREPAID]: "Картой заранее",
};

/** Статусы заказа — совпадают с `enum` в `server/constants/orderConstants.js`. */
export const ORDER_STATUS_PENDING = "pending";
export const ORDER_STATUS_CONFIRMED = "confirmed";
export const ORDER_STATUS_SHIPPED = "shipped";
export const ORDER_STATUS_DELIVERED = "delivered";
export const ORDER_STATUS_CANCELLED = "cancelled";

export const ORDER_STATUSES = [
  ORDER_STATUS_PENDING,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_SHIPPED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_CANCELLED,
];

export const ORDER_STATUS_LABEL_RU = {
  [ORDER_STATUS_PENDING]: "В обработке",
  [ORDER_STATUS_CONFIRMED]: "Подтверждён",
  [ORDER_STATUS_SHIPPED]: "Отправлен",
  [ORDER_STATUS_DELIVERED]: "Доставлен",
  [ORDER_STATUS_CANCELLED]: "Отменён",
};

/** Лейблы статусов в «Мои продажи» (seller): shipped → «Принять». */
export const SALES_ORDER_STATUS_LABEL_RU = {
  ...ORDER_STATUS_LABEL_RU,
  [ORDER_STATUS_SHIPPED]: "Принять",
};

export const ORDER_LINE_ITEM_QUANTITY_MIN = 1;

export const CART_STORAGE_KEY = "rassro:cart";
