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
/**
 * Товар уехал к покупателю и вернулся: отказ у двери, неудачное вручение,
 * возврат отправителю. Отличается от `cancelled` (отменён до отправки) —
 * иначе в статистике не видно, сколько заказов срывается на вручении.
 */
export const ORDER_STATUS_RETURNED = "returned";

export const ORDER_STATUSES = [
  ORDER_STATUS_PENDING,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_SHIPPED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_RETURNED,
];

/** Минимальное количество одной позиции заказа. */
export const ORDER_LINE_ITEM_QUANTITY_MIN = 1;

/** Версия схемы документа заказа для безопасных миграций. */
export const ORDER_SCHEMA_VERSION = 3;

/** Подпись позиции заказа, если товар удалён и снимка названия нет. */
export const ORDER_LINE_ITEM_DELETED_PRODUCT_NAME = "Товар удалён";

/** In-app / push: новый заказ на товар продавца. */
export const IN_APP_NOTIFICATION_KIND_SELLER_NEW_ORDER = "seller_new_order";
export const IN_APP_NOTIFICATION_MESSAGE_SELLER_NEW_ORDER = "Новый заказ на ваш товар";

/**
 * In-app / push покупателю при смене статуса его позиции.
 *
 * До этого сайт уведомлял только продавца о новом заказе, и покупатель узнавал
 * об отправке, только если сам открывал заказ.
 */
export const IN_APP_NOTIFICATION_KIND_BUYER_ORDER_STATUS = "buyer_order_status";

/**
 * Покупатель отказался от позиции. Без этого продавец про отказ не узнаёт
 * вовсе: уведомления о статусе адресованы покупателю и при его же действии
 * подавляются.
 */
export const IN_APP_NOTIFICATION_KIND_SELLER_ORDER_RETURNED =
  "seller_order_returned";
export const IN_APP_NOTIFICATION_MESSAGE_SELLER_ORDER_RETURNED =
  "Покупатель отказался от заказа";

/** Подписи статуса для покупателя: он читает «отправлен», а не `shipped`. */
export const BUYER_ORDER_STATUS_MESSAGES = Object.freeze({
  [ORDER_STATUS_SHIPPED]: "Заказ передан в доставку",
  [ORDER_STATUS_DELIVERED]: "Заказ доставлен — подтвердите получение",
  [ORDER_STATUS_CANCELLED]: "Продавец отменил позицию заказа",
  [ORDER_STATUS_RETURNED]: "Заказ вернулся продавцу",
});
