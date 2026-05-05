/** Как `default: 'pending'` у `status` в `server/models/OrderModel.js`. */
export const ORDER_STATUS_PENDING = "pending";

/**
 * Пример `paymentMethod`; на сервере поле — `String` без enum.
 * Используйте свои константы под реальные способы оплаты.
 */
export const ORDER_PAYMENT_METHOD_CARD = "card";

/** Как `min: 1` у `quantity` в элементе `items` на сервере. */
export const ORDER_LINE_ITEM_QUANTITY_MIN = 1;

/** Порядок полей lean-документа заказа для визуализации. */
export const ORDER_STRUCTURE_KEYS = [
  "_id",
  "userBuyerId",
  "items",
  "totalAmount",
  "deliveryAddress",
  "deliveryDate",
  "paymentMethod",
  "status",
  "createdAt",
  "updatedAt",
];
