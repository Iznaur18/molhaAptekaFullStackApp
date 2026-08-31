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
 * Ступени сборки, общие для самовывоза и доставки.
 *
 * До них покупатель между «В обработке» и «Отправлен» не видел ничего и не
 * понимал, взялся ли продавец за заказ вообще.
 */
export const ORDER_STATUS_ACCEPTED = "accepted";
export const ORDER_STATUS_ASSEMBLING = "assembling";

/** Развилка лестниц: самовывоз ждут на точке, доставку — отгружают. */
export const ORDER_STATUS_READY_FOR_PICKUP = "ready_for_pickup";
export const ORDER_STATUS_READY_TO_SHIP = "ready_to_ship";
/**
 * Товар уехал к покупателю и вернулся: отказ у двери, неудачное вручение,
 * возврат отправителю. Отличается от `cancelled` (отменён до отправки) —
 * иначе в статистике не видно, сколько заказов срывается на вручении.
 */
export const ORDER_STATUS_RETURNED = "returned";

export const ORDER_STATUSES = [
  ORDER_STATUS_PENDING,
  ORDER_STATUS_ACCEPTED,
  ORDER_STATUS_ASSEMBLING,
  ORDER_STATUS_READY_FOR_PICKUP,
  ORDER_STATUS_READY_TO_SHIP,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_SHIPPED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_RETURNED,
];

/**
 * Насколько статус продвинут по лестнице. Статус заказа — это статус самой
 * отстающей позиции, поэтому сравнивать их надо числом, а не перебором.
 *
 * `ready_for_pickup` и `ready_to_ship` — параллельные ветки одной ступени:
 * отправление идёт либо самовывозом, либо доставкой, но в одном заказе рядом
 * могут оказаться оба.
 */
export const ORDER_STATUS_LADDER_RANK = Object.freeze({
  [ORDER_STATUS_PENDING]: 0,
  [ORDER_STATUS_ACCEPTED]: 1,
  [ORDER_STATUS_ASSEMBLING]: 2,
  [ORDER_STATUS_READY_FOR_PICKUP]: 3,
  [ORDER_STATUS_READY_TO_SHIP]: 3,
  [ORDER_STATUS_SHIPPED]: 4,
  [ORDER_STATUS_DELIVERED]: 5,
  [ORDER_STATUS_CONFIRMED]: 6,
});

/** Сделка закончилась: по лестнице такие позиции уже не двигаются. */
export const ORDER_TERMINAL_STATUSES = Object.freeze([
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_RETURNED,
]);

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
  [ORDER_STATUS_ACCEPTED]: "Продавец принял заказ",
  [ORDER_STATUS_ASSEMBLING]: "Заказ собирают",
  [ORDER_STATUS_READY_FOR_PICKUP]: "Заказ готов к выдаче — можно забирать",
  [ORDER_STATUS_READY_TO_SHIP]: "Заказ готов к отгрузке",
  [ORDER_STATUS_SHIPPED]: "Заказ передан в доставку",
  [ORDER_STATUS_DELIVERED]: "Заказ доставлен — подтвердите получение",
  [ORDER_STATUS_CANCELLED]: "Продавец отменил позицию заказа",
  [ORDER_STATUS_RETURNED]: "Заказ вернулся продавцу",
});
