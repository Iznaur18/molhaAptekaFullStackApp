/**
 * Эскроу: деньги покупателя лежат на счёте площадки, пока сделка не закрыта.
 *
 * СБП — одностадийный платёж, холдирования у него нет. Поэтому «заморозка» —
 * это НЕ незавершённый платёж у провайдера, а состояние в нашей базе: деньги
 * уже списаны и уже наши, просто мы знаем, что они чужие.
 *
 * Учёт ведётся по строкам, а не по отправлению целиком: позиции одного
 * продавца живут своей жизнью — одну подтвердили, другую вернули, третья ещё
 * едет. Одна сумма на всё отправление означала бы, что первое же
 * подтверждение отдаёт продавцу и деньги за неотгруженное.
 */

/** Деньги пришли, сделка не закрыта. Выплачивать нельзя, вернуть можно. */
export const ESCROW_STATE_HELD = "held";
/** Покупатель подтвердил или вышел срок — можно выплачивать продавцу. */
export const ESCROW_STATE_RELEASABLE = "releasable";
/**
 * Сделка по этой строке не состоялась — деньги причитаются покупателю.
 *
 * Отдельное состояние, а не сразу `refunded`: возврата у провайдера пока нет,
 * и без этой пометки отменённая позиция молча уезжала бы продавцу вместе с
 * остальными. Долг возникает в момент отмены, а не в момент, когда мы
 * научимся его отдавать.
 */
export const ESCROW_STATE_REFUNDABLE = "refundable";
/** Выплата продавцу проведена. */
export const ESCROW_STATE_PAID_OUT = "paid_out";
/** Деньги вернулись покупателю. */
export const ESCROW_STATE_REFUNDED = "refunded";

export const ESCROW_STATES = Object.freeze([
  ESCROW_STATE_HELD,
  ESCROW_STATE_RELEASABLE,
  ESCROW_STATE_REFUNDABLE,
  ESCROW_STATE_PAID_OUT,
  ESCROW_STATE_REFUNDED,
]);

/**
 * Порядок «незакрытости» состояний, от самого открытого к закрытому.
 *
 * Состояние записи целиком — это самое незакрытое состояние среди её строк:
 * пока хоть одна позиция висит в `held`, отправление не закрыто, чем бы ни
 * кончились остальные. Сводку держим отдельным полем ради дешёвых выборок,
 * но истина всегда в строках.
 */
export const ESCROW_STATE_OPENNESS_ORDER = Object.freeze([
  ESCROW_STATE_HELD,
  ESCROW_STATE_RELEASABLE,
  ESCROW_STATE_REFUNDABLE,
  ESCROW_STATE_PAID_OUT,
  ESCROW_STATE_REFUNDED,
]);

/** Деньги за товар — по строке на позицию заказа. */
export const ESCROW_LINE_KIND_GOODS = "goods";
/**
 * Деньги за доставку продавца — одна строка на отправление.
 *
 * Доставка по позициям не делится: продавец съездил один раз, сколько бы
 * товаров ни вёз.
 */
export const ESCROW_LINE_KIND_DELIVERY = "delivery";

export const ESCROW_LINE_KINDS = Object.freeze([
  ESCROW_LINE_KIND_GOODS,
  ESCROW_LINE_KIND_DELIVERY,
]);

/**
 * Через сколько дней после вручения деньги уходят продавцу сами.
 *
 * Без этого срока часть выплат зависла бы навсегда: покупатель получил товар,
 * всё в порядке, и подтверждать ему нечего — он просто закрыл приложение.
 */
export const ESCROW_AUTO_RELEASE_DAYS = 7;

export const ESCROW_AUTO_RELEASE_MS = ESCROW_AUTO_RELEASE_DAYS * 24 * 60 * 60 * 1000;

/** Раз в час: точность до часа при сроке в неделю более чем достаточна. */
export const ESCROW_CRON_INTERVAL_MS = 60 * 60 * 1000;

/** Сколько строк разбираем за один проход, чтобы не держать транзакцию долго. */
export const ESCROW_RELEASE_BATCH_SIZE = 200;

/** Причина перехода — она попадает в леджер и в money-лог. */
export const ESCROW_RELEASE_REASON_BUYER = "buyer_confirmed";
export const ESCROW_RELEASE_REASON_TIMEOUT = "auto_release_timeout";
/** Доставку размораживает первая же разморозка товара: продавец выезжал. */
export const ESCROW_RELEASE_REASON_SHIPMENT_DELIVERED = "shipment_delivered";

export const ESCROW_RELEASE_REASONS = Object.freeze([
  ESCROW_RELEASE_REASON_BUYER,
  ESCROW_RELEASE_REASON_TIMEOUT,
  ESCROW_RELEASE_REASON_SHIPMENT_DELIVERED,
]);

/** Позицию отменили, пока товар был у продавца. */
export const ESCROW_REFUND_REASON_ITEM_CANCELLED = "item_cancelled";
/** Позицию вернули из доставки или от двери. */
export const ESCROW_REFUND_REASON_ITEM_RETURNED = "item_returned";
/**
 * Ни одна позиция отправления не дошла — возить было нечего.
 *
 * Тариф доставки остаётся продавцу, только если он выезжал. Признак выезда —
 * хоть одна размороженная позиция: раньше вручения разморозка невозможна.
 */
export const ESCROW_REFUND_REASON_SHIPMENT_UNDELIVERED = "shipment_undelivered";

export const ESCROW_REFUND_REASONS = Object.freeze([
  ESCROW_REFUND_REASON_ITEM_CANCELLED,
  ESCROW_REFUND_REASON_ITEM_RETURNED,
  ESCROW_REFUND_REASON_SHIPMENT_UNDELIVERED,
]);

export const ESCROW_ALREADY_SETTLED_MESSAGE =
  "По этому отправлению деньги уже выплачены или возвращены";
