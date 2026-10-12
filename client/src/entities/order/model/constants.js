import {
  ORDER_STATUS_ACCEPTED,
  ORDER_STATUS_ASSEMBLING,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_READY_FOR_PICKUP,
  ORDER_STATUS_READY_TO_SHIP,
} from "@izibuy/shared-lib";

/** Способы оплаты — совпадают с `enum` в `server/constants/orderConstants.js`. */
export const ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY = "cashOnDelivery";
export const ORDER_PAYMENT_METHOD_CARD_PREPAID = "cardPrepaid";
/** Перевод продавцу при получении — платформа денег не касается. */
export const ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY = "cardOnDelivery";

export const ORDER_PAYMENT_METHODS = [
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY,
];

/**
 * Способы оплаты, реально доступные покупателю сейчас. `cardPrepaid` виден
 * в UI, но disabled до интеграции эквайринга.
 */
export const ORDER_PAYMENT_METHODS_SELECTABLE = [
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY,
];

/** Способ оплаты по умолчанию в формах чекаута. */
export const ORDER_PAYMENT_METHOD_DEFAULT = ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY;

export const ORDER_PAYMENT_METHOD_LABEL_RU = {
  [ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY]: "Наличными",
  // Значение в базе осталось `cardPrepaid` — это «предоплата через
  // площадку». Способ у провайдера теперь строго СБП, и подпись должна
  // обещать то, что покупатель реально увидит.
  [ORDER_PAYMENT_METHOD_CARD_PREPAID]: "СБП",
  [ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY]: "Картой при получении",
};

/**
 * Статусы заказа и их подписи — одни для сайта и приложения, источник в
 * `@izibuy/shared-lib`. Здесь реэкспорт, чтобы импорты по сайту не менялись.
 */
export {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_RU,
  SALES_ORDER_STATUS_LABEL_RU,
  ORDER_STATUS_ACCEPTED,
  ORDER_STATUS_ASSEMBLING,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_COURIER_ASSIGNED,
  ORDER_STATUS_COURIER_HOLDING,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_DISPUTED,
  ORDER_STATUS_IN_DELIVERY,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_READY_FOR_PICKUP,
  ORDER_STATUS_READY_TO_SHIP,
  ORDER_STATUS_RETURNED,
  ORDER_STATUS_SHIPPED,
} from "@izibuy/shared-lib";

/**
 * Ступени, которые продавец двигает кнопкой. Совпадает с
 * `ORDER_SHIPMENT_ADVANCE_STATUSES` в контракте.
 */
export const SHIPMENT_ADVANCE_BUTTON_LABEL_RU = {
  [ORDER_STATUS_ACCEPTED]: "Принять",
  [ORDER_STATUS_ASSEMBLING]: "На сборку",
  [ORDER_STATUS_READY_FOR_PICKUP]: "Готов к выдаче",
  [ORDER_STATUS_READY_TO_SHIP]: "Готов к отгрузке",
};

/** Товар ещё у продавца: отсюда можно и отменить, и отгрузить. */
export const ORDER_PRE_SHIPMENT_STATUSES = [
  ORDER_STATUS_PENDING,
  ORDER_STATUS_ACCEPTED,
  ORDER_STATUS_ASSEMBLING,
  ORDER_STATUS_READY_FOR_PICKUP,
  ORDER_STATUS_READY_TO_SHIP,
];

export const ORDER_LINE_ITEM_QUANTITY_MIN = 1;

export const CART_STORAGE_KEY = "rassro:cart";

export const IN_APP_NOTIFICATION_KIND_SELLER_NEW_ORDER = "seller_new_order";
/** Статус заказа покупателя: принят, «оплатите», отменён и т.п. */
export const IN_APP_NOTIFICATION_KIND_BUYER_ORDER_STATUS = "buyer_order_status";
