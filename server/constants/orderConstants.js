/** Способы оплаты заказа (enum в OrderModel и валидации). */
export const ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY = "cashOnDelivery";
export const ORDER_PAYMENT_METHOD_CARD_PREPAID = "cardPrepaid";

export const ORDER_PAYMENT_METHODS = [
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
];

/** Жизненный цикл статуса заказа (enum в OrderModel и валидации). */
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

/** Минимальное количество одной позиции заказа. */
export const ORDER_LINE_ITEM_QUANTITY_MIN = 1;

/** Версия схемы документа заказа для безопасных миграций. */
export const ORDER_SCHEMA_VERSION = 3;

/** Подпись позиции заказа, если товар удалён и снимка названия нет. */
export const ORDER_LINE_ITEM_DELETED_PRODUCT_NAME = "Товар удалён";
