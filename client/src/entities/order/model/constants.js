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
  [ORDER_PAYMENT_METHOD_CARD_PREPAID]: "Картой заранее",
  [ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY]: "Картой при получении",
};

/** Статусы заказа — совпадают с `enum` в `server/constants/orderConstants.js`. */
export const ORDER_STATUS_PENDING = "pending";
export const ORDER_STATUS_CONFIRMED = "confirmed";
export const ORDER_STATUS_SHIPPED = "shipped";
export const ORDER_STATUS_DELIVERED = "delivered";
export const ORDER_STATUS_CANCELLED = "cancelled";
/** Товар уехал и вернулся: отказ у двери, неудачное вручение. */
export const ORDER_STATUS_RETURNED = "returned";
/** Ступени сборки, общие для самовывоза и доставки. */
export const ORDER_STATUS_ACCEPTED = "accepted";
export const ORDER_STATUS_ASSEMBLING = "assembling";
/** Развилка лестниц: самовывоз ждут на точке, доставку — отгружают. */
export const ORDER_STATUS_READY_FOR_PICKUP = "ready_for_pickup";
export const ORDER_STATUS_READY_TO_SHIP = "ready_to_ship";
/** Ступени курьера. */
export const ORDER_STATUS_COURIER_ASSIGNED = "courier_assigned";
export const ORDER_STATUS_COURIER_HOLDING = "courier_holding";
export const ORDER_STATUS_IN_DELIVERY = "in_delivery";
/** Товар вне контроля: разбирается модератором. */
export const ORDER_STATUS_DISPUTED = "disputed";

export const ORDER_STATUSES = [
  ORDER_STATUS_PENDING,
  ORDER_STATUS_ACCEPTED,
  ORDER_STATUS_ASSEMBLING,
  ORDER_STATUS_READY_FOR_PICKUP,
  ORDER_STATUS_READY_TO_SHIP,
  ORDER_STATUS_COURIER_ASSIGNED,
  ORDER_STATUS_COURIER_HOLDING,
  ORDER_STATUS_IN_DELIVERY,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_SHIPPED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_RETURNED,
  ORDER_STATUS_DISPUTED,
];

export const ORDER_STATUS_LABEL_RU = {
  [ORDER_STATUS_PENDING]: "В обработке",
  [ORDER_STATUS_ACCEPTED]: "Принят",
  [ORDER_STATUS_ASSEMBLING]: "На сборке",
  [ORDER_STATUS_READY_FOR_PICKUP]: "Готов к выдаче",
  [ORDER_STATUS_READY_TO_SHIP]: "Готов к отгрузке",
  [ORDER_STATUS_COURIER_ASSIGNED]: "Принят курьером",
  [ORDER_STATUS_COURIER_HOLDING]: "У курьера",
  [ORDER_STATUS_IN_DELIVERY]: "На доставке",
  [ORDER_STATUS_CONFIRMED]: "Подтверждён",
  [ORDER_STATUS_SHIPPED]: "Отправлен",
  [ORDER_STATUS_DELIVERED]: "Доставлен",
  [ORDER_STATUS_CANCELLED]: "Отменён",
  [ORDER_STATUS_RETURNED]: "Возвращён",
  [ORDER_STATUS_DISPUTED]: "Спор",
};

/**
 * Лейблы статусов в «Мои продажи».
 *
 * Раньше продавцу `shipped` показывался как «Принят» — теперь «Принят» это
 * настоящая ступень лестницы, и два разных статуса под одной подписью
 * путали бы продавца.
 */
export const SALES_ORDER_STATUS_LABEL_RU = {
  ...ORDER_STATUS_LABEL_RU,
  [ORDER_STATUS_SHIPPED]: "Отгружен",
};

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
