import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";

/** Синхрон с `server/constants/sellerFortuneWheelConstants.js`. */
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
export const FORTUNE_WHEEL_RESULTS = [
  FORTUNE_WHEEL_RESULT_WIN,
  FORTUNE_WHEEL_RESULT_EMPTY,
];

/**
 * Код, который попадает в `promoCodeAtOrder` позиции заказа со скидкой
 * из «Колеса фортуны» (скидка не по введённому коду, а по выигрышу).
 */
export const FORTUNE_WHEEL_ORDER_PROMO_CODE = "FORTUNEWHEEL";

export const fortuneWheelSellerIdParamsSchema = z.object({
  sellerId: mongoIdSchema,
});

export const fortuneWheelSectorSchema = z.object({
  discountPercent: z.coerce
    .number()
    .int(
      `Скидка: от ${FORTUNE_WHEEL_DISCOUNT_PERCENT_MIN} до ${FORTUNE_WHEEL_DISCOUNT_PERCENT_MAX}%`,
    )
    .min(
      FORTUNE_WHEEL_DISCOUNT_PERCENT_MIN,
      `Скидка: от ${FORTUNE_WHEEL_DISCOUNT_PERCENT_MIN} до ${FORTUNE_WHEEL_DISCOUNT_PERCENT_MAX}%`,
    )
    .max(
      FORTUNE_WHEEL_DISCOUNT_PERCENT_MAX,
      `Скидка: от ${FORTUNE_WHEEL_DISCOUNT_PERCENT_MIN} до ${FORTUNE_WHEEL_DISCOUNT_PERCENT_MAX}%`,
    ),
  durationHours: z.coerce
    .number()
    .int(
      `Срок: от ${FORTUNE_WHEEL_DURATION_HOURS_MIN} до ${FORTUNE_WHEEL_DURATION_HOURS_MAX} ч`,
    )
    .min(
      FORTUNE_WHEEL_DURATION_HOURS_MIN,
      `Срок: от ${FORTUNE_WHEEL_DURATION_HOURS_MIN} до ${FORTUNE_WHEEL_DURATION_HOURS_MAX} ч`,
    )
    .max(
      FORTUNE_WHEEL_DURATION_HOURS_MAX,
      `Срок: от ${FORTUNE_WHEEL_DURATION_HOURS_MIN} до ${FORTUNE_WHEEL_DURATION_HOURS_MAX} ч`,
    ),
  /**
   * Шанс выпадения секции, %. Сумма по всем секциям — ровно 100
   * (проверяется на уровне конфига). 0 — секция не выпадает никогда.
   */
  chancePercent: z.coerce
    .number()
    .int(
      `Шанс: от ${FORTUNE_WHEEL_CHANCE_PERCENT_MIN} до ${FORTUNE_WHEEL_CHANCE_PERCENT_MAX}%`,
    )
    .min(
      FORTUNE_WHEEL_CHANCE_PERCENT_MIN,
      `Шанс: от ${FORTUNE_WHEEL_CHANCE_PERCENT_MIN} до ${FORTUNE_WHEEL_CHANCE_PERCENT_MAX}%`,
    )
    .max(
      FORTUNE_WHEEL_CHANCE_PERCENT_MAX,
      `Шанс: от ${FORTUNE_WHEEL_CHANCE_PERCENT_MIN} до ${FORTUNE_WHEEL_CHANCE_PERCENT_MAX}%`,
    ),
  /** Выключенная секция — «пусто»: выпадает по своему шансу, но приза нет. */
  enabled: z.boolean().default(true),
  /**
   * Товар-приз: если указан, секция дарит этот товар (1 шт за 0 ₽)
   * ВМЕСТО скидки — поля скидки игнорируются. Товар должен принадлежать
   * продавцу (проверяется на сервере при сохранении конфига).
   */
  prizeProductId: mongoIdSchema.nullable().default(null),
});

export const putFortuneWheelConfigBodySchema = z
  .object({
    enabled: z.boolean({ required_error: "Укажите enabled: true/false" }),
    sectors: z
      .array(fortuneWheelSectorSchema)
      .min(
        FORTUNE_WHEEL_SECTORS_MIN,
        `Секций: от ${FORTUNE_WHEEL_SECTORS_MIN} до ${FORTUNE_WHEEL_SECTORS_MAX}`,
      )
      .max(
        FORTUNE_WHEEL_SECTORS_MAX,
        `Секций: от ${FORTUNE_WHEEL_SECTORS_MIN} до ${FORTUNE_WHEEL_SECTORS_MAX}`,
      ),
  })
  .refine(
    (data) =>
      data.sectors.reduce(
        (total, sector) => total + (Number(sector.chancePercent) || 0),
        0,
      ) === FORTUNE_WHEEL_CHANCE_TOTAL,
    {
      message: `Сумма шансов всех секций должна быть ровно ${FORTUNE_WHEEL_CHANCE_TOTAL}%`,
    },
  )
  .refine((data) => !data.enabled || data.sectors.some((sector) => sector.enabled), {
    message: "Включите хотя бы одну призовую секцию или выключите игру",
  });
