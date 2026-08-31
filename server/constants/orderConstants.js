/** Способы оплаты заказа (enum в OrderModel и валидации). */
export const ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY = "cashOnDelivery";
export const ORDER_PAYMENT_METHOD_CARD_PREPAID = "cardPrepaid";
/**
 * Перевод продавцу при получении.
 *
 * Отдельно от `cardPrepaid`: тот значит предоплату и зарезервирован под
 * будущий эквайринг. Здесь платформа денег не касается — покупатель
 * переводит напрямую на реквизиты продавца.
 */
export const ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY = "cardOnDelivery";

export const ORDER_PAYMENT_METHODS = [
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY,
];

/**
 * Наличные и курьеры Gitorg несовместимы.
 *
 * Наличные покупатель отдаёт курьеру, продавец их не видит и не может
 * подтвердить оплату — третье рукопожатие рассыпается, а у незнакомого
 * человека оказываются и товар, и деньги продавца.
 */
export const COURIER_DELIVERY_CASH_FORBIDDEN_MESSAGE =
  "Наличные недоступны при доставке курьером Gitorg — выберите оплату картой при получении";

export const SELLER_PAYOUT_REQUISITES_REQUIRED_MESSAGE =
  "У продавца не указаны реквизиты для перевода — оплата картой при получении невозможна";

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

/** Ступени курьера. `shipped` остаётся синонимом «в пути» у старых заказов. */
export const ORDER_STATUS_COURIER_ASSIGNED = "courier_assigned";
export const ORDER_STATUS_COURIER_HOLDING = "courier_holding";
export const ORDER_STATUS_IN_DELIVERY = "in_delivery";

/** Развилка лестниц: самовывоз ждут на точке, доставку — отгружают. */
export const ORDER_STATUS_READY_FOR_PICKUP = "ready_for_pickup";
export const ORDER_STATUS_READY_TO_SHIP = "ready_to_ship";
/**
 * Товар уехал к покупателю и вернулся: отказ у двери, неудачное вручение,
 * возврат отправителю. Отличается от `cancelled` (отменён до отправки) —
 * иначе в статистике не видно, сколько заказов срывается на вручении.
 */
export const ORDER_STATUS_RETURNED = "returned";

/**
 * Товар вне контроля: курьер пропал, вручение сорвалось непонятно как.
 *
 * Не терминальный статус: сделка не закрыта, её разбирает модератор. Остаток
 * товара при этом на витрину не возвращается — иначе продадим то, что
 * неизвестно где.
 */
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
  [ORDER_STATUS_COURIER_ASSIGNED]: 4,
  [ORDER_STATUS_COURIER_HOLDING]: 5,
  // Legacy `shipped` значит ровно «в пути» — тот же уровень, что и in_delivery.
  [ORDER_STATUS_SHIPPED]: 6,
  [ORDER_STATUS_IN_DELIVERY]: 6,
  [ORDER_STATUS_DELIVERED]: 7,
  [ORDER_STATUS_CONFIRMED]: 8,
});

/** Сделка закончилась: по лестнице такие позиции уже не двигаются. */
export const ORDER_TERMINAL_STATUSES = Object.freeze([
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_RETURNED,
]);

/**
 * Позиции, которые держат остаток товара занятым.
 *
 * Это всё, кроме отменённого, вернувшегося и подтверждённого: на
 * подтверждении остаток списывается по-настоящему, а отмена и возврат его
 * освобождают. Спор тоже держит — товар неизвестно где, и продавать его
 * второй раз нельзя.
 *
 * Перечисляем вычитанием, а не списком: список забыли бы пополнить при
 * появлении новой ступени, и товар молча становился бы доступен снова.
 */
export const ORDER_STOCK_RESERVING_STATUSES = Object.freeze(
  ORDER_STATUSES.filter(
    (status) =>
      status !== ORDER_STATUS_CANCELLED &&
      status !== ORDER_STATUS_RETURNED &&
      status !== ORDER_STATUS_CONFIRMED,
  ),
);

/**
 * Товар ещё у продавца. Отсюда заказ можно отменить без последствий и отсюда
 * же его отгружают.
 *
 * Ступени сборки необязательные: продавец вправе отгрузить сразу из
 * «В обработке», не проходя «Принят» и «На сборке».
 */
export const ORDER_PRE_SHIPMENT_STATUSES = Object.freeze([
  ORDER_STATUS_PENDING,
  ORDER_STATUS_ACCEPTED,
  ORDER_STATUS_ASSEMBLING,
  ORDER_STATUS_READY_FOR_PICKUP,
  ORDER_STATUS_READY_TO_SHIP,
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
  [ORDER_STATUS_COURIER_ASSIGNED]: "Курьер принял заказ",
  [ORDER_STATUS_COURIER_HOLDING]: "Заказ у курьера",
  [ORDER_STATUS_IN_DELIVERY]: "Заказ везут к вам",
  [ORDER_STATUS_SHIPPED]: "Заказ передан в доставку",
  [ORDER_STATUS_DELIVERED]: "Заказ доставлен — подтвердите получение",
  [ORDER_STATUS_CANCELLED]: "Продавец отменил позицию заказа",
  [ORDER_STATUS_RETURNED]: "Заказ вернулся продавцу",
});
