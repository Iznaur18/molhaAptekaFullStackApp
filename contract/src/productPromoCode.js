import { z } from "zod";

export const PRODUCT_PROMO_CODES_MAX_ACTIVE = 10;
export const PRODUCT_PROMO_CODE_MAX_LENGTH = 32;
export const PRODUCT_PROMO_CODE_MIN_LENGTH = 2;
export const PRODUCT_PROMO_DISCOUNT_PERCENT_MIN = 1;
export const PRODUCT_PROMO_DISCOUNT_PERCENT_MAX = 99;
export const PRODUCT_PROMO_MAX_ACTIVATIONS_MIN = 1;
export const PRODUCT_PROMO_MAX_ACTIVATIONS_MAX = 1000;

export const PRODUCT_PROMO_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

export const normalizeProductPromoCode = (raw) =>
  String(raw ?? "")
    .trim()
    .toUpperCase();

export const productPromoCodeValueSchema = z
  .string()
  .trim()
  .min(PRODUCT_PROMO_CODE_MIN_LENGTH, "Укажите промокод")
  .max(PRODUCT_PROMO_CODE_MAX_LENGTH, "Промокод слишком длинный")
  .regex(PRODUCT_PROMO_CODE_PATTERN, "Только латиница, цифры, _ и -")
  .transform((value) => normalizeProductPromoCode(value));

export const productPromoDiscountPercentSchema = z.coerce
  .number()
  .int()
  .min(
    PRODUCT_PROMO_DISCOUNT_PERCENT_MIN,
    `Скидка от ${PRODUCT_PROMO_DISCOUNT_PERCENT_MIN}%`,
  )
  .max(
    PRODUCT_PROMO_DISCOUNT_PERCENT_MAX,
    `Скидка до ${PRODUCT_PROMO_DISCOUNT_PERCENT_MAX}%`,
  );

export const productPromoMaxActivationsSchema = z.coerce
  .number()
  .int()
  .min(
    PRODUCT_PROMO_MAX_ACTIVATIONS_MIN,
    `Минимум ${PRODUCT_PROMO_MAX_ACTIVATIONS_MIN} активация`,
  )
  .max(
    PRODUCT_PROMO_MAX_ACTIVATIONS_MAX,
    `Максимум ${PRODUCT_PROMO_MAX_ACTIVATIONS_MAX} активаций`,
  );

export const productPromoCodeItemSchema = z.object({
  code: productPromoCodeValueSchema,
  discountPercent: productPromoDiscountPercentSchema,
  enabled: z.coerce.boolean(),
  maxActivations: productPromoMaxActivationsSchema,
  activationsUsed: z.coerce.number().int().min(0).optional(),
});

export const replaceProductPromoCodesBodySchema = z.object({
  promoCodes: z.array(productPromoCodeItemSchema).max(
    PRODUCT_PROMO_CODES_MAX_ACTIVE * 2,
    `Слишком много промокодов`,
  ),
});

export const activateProductPromoCodeBodySchema = z.object({
  code: productPromoCodeValueSchema,
});

export const productPromoCodePublicSchema = z.object({
  code: z.string(),
  discountPercent: z.number().int(),
  enabled: z.boolean(),
  maxActivations: z.number().int(),
  activationsUsed: z.number().int(),
});

export const listProductPromoCodesDataSchema = z.object({
  promoCodes: z.array(productPromoCodePublicSchema),
  productHasActivePromoCodes: z.boolean(),
});

export const replaceProductPromoCodesDataSchema = listProductPromoCodesDataSchema;

export const activateProductPromoCodeDataSchema = z.object({
  productId: z.string(),
  code: z.string(),
  discountPercent: z.number().int(),
  message: z.string(),
});

export const appliedProductPromoSchema = z.object({
  productId: z.string(),
  code: z.string(),
  discountPercent: z.number().int(),
});

export const myAppliedProductPromosDataSchema = z.object({
  appliedPromos: z.array(appliedProductPromoSchema),
});
