import { z } from "zod";

/** Синхрон с `server/constants/productModerationConstants.js`. */
export const PRODUCT_MODERATION_STATUSES = ["pending", "approved", "rejected"];

/** Минимальный контракт карточки; остальные поля — passthrough. */
export const productFromApiSchema = z
  .object({
    _id: z.string(),
    productName: z.string().optional(),
    productPrice: z.number().optional(),
    productModerationStatus: z.enum(PRODUCT_MODERATION_STATUSES).optional(),
    productModerationComment: z.string().optional(),
    productIsAvailable: z.boolean().optional(),
    soldQuantity: z.number().optional(),
  })
  .passthrough();
