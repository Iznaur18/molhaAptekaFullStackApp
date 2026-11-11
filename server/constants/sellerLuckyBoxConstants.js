/** Синхрон с `contract/src/sellerLuckyBox.js`. */
export const LUCKY_BOX_BOXES_TOTAL = 6;
export const LUCKY_BOX_PRIZES_MIN = 1;
export const LUCKY_BOX_PRIZES_MAX = 4;
export const LUCKY_BOX_DISCOUNT_PERCENT_MIN = 1;
export const LUCKY_BOX_DISCOUNT_PERCENT_MAX = 90;
export const LUCKY_BOX_DURATION_HOURS_MIN = 1;
export const LUCKY_BOX_DURATION_HOURS_MAX = 24;
/** Попыток в день: вторая даётся, только если первая оказалась пустой. */
export const LUCKY_BOX_ATTEMPTS_PER_DAY = 2;

export const LUCKY_BOX_RESULT_WIN = "win";
export const LUCKY_BOX_RESULT_EMPTY = "empty";

export const LUCKY_BOX_WIN_STATUS_ACTIVE = "active";
export const LUCKY_BOX_WIN_STATUS_USED = "used";
export const LUCKY_BOX_WIN_STATUS_EXPIRED = "expired";

export const LUCKY_BOX_WIN_STATUSES = [
  LUCKY_BOX_WIN_STATUS_ACTIVE,
  LUCKY_BOX_WIN_STATUS_USED,
  LUCKY_BOX_WIN_STATUS_EXPIRED,
];

/** Код скидки из «Коробок удачи» в `promoCodeAtOrder` позиции заказа. */
export const LUCKY_BOX_ORDER_PROMO_CODE = "LUCKYBOX";
