/** Синхрон с `contract/src/sellerFortuneWheel.js`. */
export const FORTUNE_WHEEL_SECTORS_MIN = 2;
export const FORTUNE_WHEEL_SECTORS_MAX = 8;
export const FORTUNE_WHEEL_DISCOUNT_PERCENT_MIN = 1;
export const FORTUNE_WHEEL_DISCOUNT_PERCENT_MAX = 90;
export const FORTUNE_WHEEL_DURATION_HOURS_MIN = 1;
export const FORTUNE_WHEEL_DURATION_HOURS_MAX = 24;
export const FORTUNE_WHEEL_CHANCE_PERCENT_MIN = 0;
export const FORTUNE_WHEEL_CHANCE_PERCENT_MAX = 100;
/** Сумма шансов всех секций — ровно 100%. */
export const FORTUNE_WHEEL_CHANCE_TOTAL = 100;
/** Один спин в день (по МСК) на продавца. */
export const FORTUNE_WHEEL_SPINS_PER_DAY = 1;

export const FORTUNE_WHEEL_RESULT_WIN = "win";
export const FORTUNE_WHEEL_RESULT_EMPTY = "empty";

export const FORTUNE_WHEEL_WIN_STATUS_ACTIVE = "active";
export const FORTUNE_WHEEL_WIN_STATUS_USED = "used";
export const FORTUNE_WHEEL_WIN_STATUS_EXPIRED = "expired";

export const FORTUNE_WHEEL_WIN_STATUSES = [
  FORTUNE_WHEEL_WIN_STATUS_ACTIVE,
  FORTUNE_WHEEL_WIN_STATUS_USED,
  FORTUNE_WHEEL_WIN_STATUS_EXPIRED,
];

/** Код скидки из «Колеса фортуны» в `promoCodeAtOrder` позиции заказа. */
export const FORTUNE_WHEEL_ORDER_PROMO_CODE = "FORTUNEWHEEL";
