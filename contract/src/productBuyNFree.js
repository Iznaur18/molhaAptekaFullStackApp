import { z } from "zod";

export const PRODUCT_BUY_N_FREE_THRESHOLD_MIN = 2;
export const PRODUCT_BUY_N_FREE_THRESHOLD_MAX = 10;

export const PRODUCT_BUY_N_FREE_CONFIG_REQUIRED_MESSAGE =
  "Сначала укажите, через сколько покупок товар будет бесплатным";
export const PRODUCT_BUY_N_FREE_THRESHOLD_MESSAGE = `Укажите число от ${PRODUCT_BUY_N_FREE_THRESHOLD_MIN} до ${PRODUCT_BUY_N_FREE_THRESHOLD_MAX}`;

export const productBuyNFreeThresholdFieldSchema = z.coerce
  .number()
  .int()
  .min(PRODUCT_BUY_N_FREE_THRESHOLD_MIN, PRODUCT_BUY_N_FREE_THRESHOLD_MESSAGE)
  .max(PRODUCT_BUY_N_FREE_THRESHOLD_MAX, PRODUCT_BUY_N_FREE_THRESHOLD_MESSAGE);

export const productBuyNFreePatchFieldsShape = {
  productBuyNFreeEnabled: z.coerce.boolean().optional(),
  productBuyNFreeThreshold: productBuyNFreeThresholdFieldSchema.optional(),
};

export const productBuyNFreeProgressDataSchema = z.object({
  enabled: z.boolean(),
  threshold: z.number().int().nullable(),
  completedPaidOrderCount: z.number().int().min(0),
  freeEligible: z.boolean(),
  freeClaimPending: z.boolean(),
});
