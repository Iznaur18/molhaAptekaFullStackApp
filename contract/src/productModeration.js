import { z } from "zod";

/** Синхрон с `server/constants/productModerationConstants.js`. */
export const PRODUCT_MODERATION_COMMENT_MAX_LENGTH = 2000;

export const rejectProductModerationBodySchema = z.object({
  productModerationComment: z
    .string()
    .max(
      PRODUCT_MODERATION_COMMENT_MAX_LENGTH,
      `Комментарий не длиннее ${PRODUCT_MODERATION_COMMENT_MAX_LENGTH} символов`,
    )
    .optional()
    .or(z.literal(""))
    .or(z.null())
    .optional(),
});
