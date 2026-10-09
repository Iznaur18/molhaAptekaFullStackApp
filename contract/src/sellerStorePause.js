import { z } from "zod";

export const SELLER_STORE_PAUSED_PRODUCT_MESSAGE =
  "Магазин на паузе — сначала включите показ товаров";

/** Body `PUT /sellers/store-pause`. */
export const sellerStorePauseBodySchema = z.object({
  paused: z.boolean({ required_error: "Укажите, включить или выключить паузу" }),
});

/**
 * Состояние паузы магазина.
 *
 * `visibleProductCount` — сколько товаров сейчас видят покупатели (это число
 * спрячет пауза). `pausedProductCount` — сколько скрыто паузой и вернётся на
 * витрину при включении.
 */
export const sellerStorePauseSchema = z.object({
  paused: z.boolean(),
  pausedAt: z.string().nullable(),
  visibleProductCount: z.number(),
  pausedProductCount: z.number(),
});

/** `data` ответов `GET /sellers/store-pause/me` и `PUT /sellers/store-pause`. */
export const sellerStorePauseDataSchema = z.object({
  storePause: sellerStorePauseSchema,
});
