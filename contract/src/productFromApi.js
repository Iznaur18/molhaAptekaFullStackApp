import { z } from "zod";

/** Синхрон с `server/constants/productModerationConstants.js`. */
export const PRODUCT_MODERATION_STATUSES = ["pending", "approved", "rejected"];

/** Минимальный контракт карточки; остальные поля — passthrough. */
export const productFromApiSchema = z
  .object({
    _id: z.coerce.string().min(1),
    productName: z.string().nullish(),
    productPrice: z.number().nullish(),
    productModerationStatus: z.enum(PRODUCT_MODERATION_STATUSES).nullish(),
    productModerationComment: z.string().nullish(),
    productIsAvailable: z.boolean().nullish(),
    productQaEnabled: z.boolean().nullish(),
    soldQuantity: z.number().nullish(),
  })
  .passthrough();
