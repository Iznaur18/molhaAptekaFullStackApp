/**
 * Литералы статусов/оплаты — из `@molha/api-contract`.
 * Здесь только серверные сообщения, лестница и производные списки.
 * import (не `export … from`): имена нужны ниже в LADDER_RANK / PRE_SHIPMENT.
 */
import {
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY,
  ORDER_PAYMENT_METHODS,
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
  ORDER_STATUS_RETURNED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_DISPUTED,
  ORDER_STATUSES,
  ORDER_LINE_ITEM_QUANTITY_MIN,
} from "@molha/api-contract";

export {
  ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PAYMENT_METHOD_CARD_ON_DELIVERY,
  ORDER_PAYMENT_METHODS,
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
  ORDER_STATUS_RETURNED,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_DISPUTED,
  ORDER_STATUSES,
  ORDER_LINE_ITEM_QUANTITY_MIN,
};

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
export const IN_APP_NOTIFICATION_KIND_SELLER_ORDER_RETURNED = "seller_order_returned";
export const IN_APP_NOTIFICATION_MESSAGE_SELLER_ORDER_RETURNED =
  "Покупатель отказался от заказа";

/** Отмена заказа целиком: перечислять каждую позицию покупателю незачем. */
export const IN_APP_NOTIFICATION_MESSAGE_BUYER_ORDER_CANCELLED =
  "Продавец отменил заказ";

/** Подписи статуса для покупателя: он читает «отправлен», а не `shipped`. */
/**
 * Срок оплаты по СБП после подтверждения продавцом.
 *
 * Неоплаченный заказ держит товар в резерве: без срока он висел бы так
 * бесконечно. Через сутки заказ отменяется, за 3 часа покупателю напоминаем.
 */
export const ORDER_PREPAYMENT_DEADLINE_MS = 24 * 60 * 60 * 1000;
export const ORDER_PREPAYMENT_REMINDER_BEFORE_MS = 3 * 60 * 60 * 1000;
/**
 * После последней попытки оплаты ждём ещё полчаса: покупатель мог как раз
 * сейчас стоять в приложении банка, и отмена в эту минуту списала бы деньги
 * за отменённый заказ.
 */
export const ORDER_PREPAYMENT_ATTEMPT_GRACE_MS = 30 * 60 * 1000;
export const ORDER_PREPAYMENT_CRON_INTERVAL_MS = 10 * 60 * 1000;
export const ORDER_PREPAYMENT_CRON_BATCH_SIZE = 100;

/** @param {string} until «4 октября, 15:30» по Москве */
export const BUYER_ORDER_PREPAYMENT_REMINDER_MESSAGE = (until) =>
  `Оплатите заказ до ${until} — иначе он отменится`;
export const BUYER_ORDER_PREPAYMENT_EXPIRED_MESSAGE =
  "Заказ отменён: оплата не пришла за сутки после подтверждения";
export const SELLER_ORDER_PREPAYMENT_EXPIRED_MESSAGE =
  "Покупатель не оплатил заказ за сутки — заказ отменён, товар снова в продаже";
/** @param {boolean} prepaid */
export const BUYER_ORDER_CARRIER_NOT_DELIVERED_MESSAGE = (prepaid) =>
  prepaid
    ? "Заказ отменён: посылку не забрали в пункте выдачи, она возвращается продавцу. Деньги за заказ вернём"
    : "Заказ отменён: посылку не забрали в пункте выдачи, она возвращается продавцу";
export const SELLER_ORDER_CARRIER_NOT_DELIVERED_MESSAGE =
  "Покупатель не забрал посылку — заказ отменён. Товар снова появится в продаже, когда служба доставки вернёт его вам";
export const BUYER_ORDER_PAID_AFTER_CANCEL_MESSAGE =
  "Оплата пришла после отмены заказа — вернём деньги";

/**
 * Продавец подтвердил заказ с предоплатой — дальше ход покупателя: без
 * этого он узнавал о необходимости заплатить, только зайдя в заказ сам.
 */
export const BUYER_ORDER_ACCEPTED_PAY_NOW_MESSAGE =
  "Продавец подтвердил заказ — оплатите по СБП";

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
