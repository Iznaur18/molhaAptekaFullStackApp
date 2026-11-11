import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";

/** Синхрон с `server/constants/sellerLuckyBoxConstants.js`. */
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
export const LUCKY_BOX_RESULTS = [LUCKY_BOX_RESULT_WIN, LUCKY_BOX_RESULT_EMPTY];

/**
 * Код, который попадает в `promoCodeAtOrder` позиции заказа со скидкой
 * из «Коробок удачи» (скидка не по введённому коду, а по выигрышу).
 */
export const LUCKY_BOX_ORDER_PROMO_CODE = "LUCKYBOX";

export const luckyBoxSellerIdParamsSchema = z.object({
  sellerId: mongoIdSchema,
});

export const luckyBoxPrizeSchema = z.object({
  discountPercent: z.coerce
    .number()
    .int(
      `Скидка: от ${LUCKY_BOX_DISCOUNT_PERCENT_MIN} до ${LUCKY_BOX_DISCOUNT_PERCENT_MAX}%`,
    )
    .min(
      LUCKY_BOX_DISCOUNT_PERCENT_MIN,
      `Скидка: от ${LUCKY_BOX_DISCOUNT_PERCENT_MIN} до ${LUCKY_BOX_DISCOUNT_PERCENT_MAX}%`,
    )
    .max(
      LUCKY_BOX_DISCOUNT_PERCENT_MAX,
      `Скидка: от ${LUCKY_BOX_DISCOUNT_PERCENT_MIN} до ${LUCKY_BOX_DISCOUNT_PERCENT_MAX}%`,
    ),
  durationHours: z.coerce
    .number()
    .int(
      `Срок: от ${LUCKY_BOX_DURATION_HOURS_MIN} до ${LUCKY_BOX_DURATION_HOURS_MAX} ч`,
    )
    .min(
      LUCKY_BOX_DURATION_HOURS_MIN,
      `Срок: от ${LUCKY_BOX_DURATION_HOURS_MIN} до ${LUCKY_BOX_DURATION_HOURS_MAX} ч`,
    )
    .max(
      LUCKY_BOX_DURATION_HOURS_MAX,
      `Срок: от ${LUCKY_BOX_DURATION_HOURS_MIN} до ${LUCKY_BOX_DURATION_HOURS_MAX} ч`,
    ),
  /** Выключенный приз не участвует в раскладке, но сохраняется в конфиге. */
  enabled: z.boolean().default(true),
  /**
   * Товар-приз: если указан, приз дарит этот товар (1 шт за 0 ₽) ВМЕСТО
   * скидки — поля скидки игнорируются. Товар должен принадлежать продавцу
   * (проверяется на сервере при сохранении конфига).
   */
  prizeProductId: mongoIdSchema.nullable().default(null),
});

export const putLuckyBoxConfigBodySchema = z
  .object({
    enabled: z.boolean({ required_error: "Укажите enabled: true/false" }),
    prizes: z
      .array(luckyBoxPrizeSchema)
      .min(
        LUCKY_BOX_PRIZES_MIN,
        `Призов: от ${LUCKY_BOX_PRIZES_MIN} до ${LUCKY_BOX_PRIZES_MAX}`,
      )
      .max(
        LUCKY_BOX_PRIZES_MAX,
        `Призов: от ${LUCKY_BOX_PRIZES_MIN} до ${LUCKY_BOX_PRIZES_MAX}`,
      ),
  })
  .refine((data) => !data.enabled || data.prizes.some((prize) => prize.enabled), {
    message: "Включите хотя бы один приз или выключите игру",
  });

export const playLuckyBoxBodySchema = z.object({
  boxIndex: z.coerce
    .number()
    .int("Номер коробки: от 0 до 5")
    .min(0, "Номер коробки: от 0 до 5")
    .max(LUCKY_BOX_BOXES_TOTAL - 1, "Номер коробки: от 0 до 5"),
});
