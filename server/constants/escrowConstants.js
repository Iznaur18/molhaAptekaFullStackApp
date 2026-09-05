/**
 * Эскроу: деньги покупателя лежат на счёте площадки, пока сделка не закрыта.
 *
 * СБП — одностадийный платёж, холдирования у него нет. Поэтому «заморозка» —
 * это НЕ незавершённый платёж у провайдера, а состояние в нашей базе: деньги
 * уже списаны и уже наши, просто мы знаем, что они чужие.
 */

/** Деньги пришли, сделка не закрыта. Выплачивать нельзя, вернуть можно. */
export const ESCROW_STATE_HELD = "held";
/** Покупатель подтвердил или вышел срок — можно выплачивать продавцу. */
export const ESCROW_STATE_RELEASABLE = "releasable";
/** Выплата продавцу проведена. */
export const ESCROW_STATE_PAID_OUT = "paid_out";
/** Деньги вернулись покупателю. */
export const ESCROW_STATE_REFUNDED = "refunded";

export const ESCROW_STATES = Object.freeze([
  ESCROW_STATE_HELD,
  ESCROW_STATE_RELEASABLE,
  ESCROW_STATE_PAID_OUT,
  ESCROW_STATE_REFUNDED,
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

/** Сколько записей разбираем за один проход, чтобы не держать транзакцию долго. */
export const ESCROW_RELEASE_BATCH_SIZE = 200;

/** Причина перехода — она попадает в леджер и в money-лог. */
export const ESCROW_RELEASE_REASON_BUYER = "buyer_confirmed";
export const ESCROW_RELEASE_REASON_TIMEOUT = "auto_release_timeout";
export const ESCROW_RELEASE_REASONS = Object.freeze([
  ESCROW_RELEASE_REASON_BUYER,
  ESCROW_RELEASE_REASON_TIMEOUT,
]);

export const ESCROW_ALREADY_SETTLED_MESSAGE =
  "По этому отправлению деньги уже выплачены или возвращены";
