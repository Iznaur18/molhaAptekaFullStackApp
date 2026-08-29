import { z } from "zod";

import { productOutOfStockLabelFieldSchema } from "./productOutOfStockLabel.js";

/** Синхрон с `server/constants/productModerationConstants.js`. */
export const PRODUCT_MODERATION_STATUSES = ["pending", "approved", "rejected"];

/** Минимальный контракт карточки; остальные поля — passthrough. */
export const productFromApiSchema = z
  .object({
    _id: z.coerce.string().min(1),
    productName: z.string().nullish(),
    productPrice: z.number().nullish(),
    productOldPrice: z.number().nullish(),
    productModerationStatus: z.enum(PRODUCT_MODERATION_STATUSES).nullish(),
    productModerationComment: z.string().nullish(),
    productIsAvailable: z.boolean().nullish(),
    productOutOfStock: z.boolean().nullish(),
    productOutOfStockLabel: productOutOfStockLabelFieldSchema.nullish(),
    isSellerClosedNow: z.boolean().nullish(),
    sellerClosedOpensAt: z.string().nullish(),
    productQaEnabled: z.boolean().nullish(),
    soldQuantity: z.number().nullish(),
    productFlashSaleEnabled: z.boolean().nullish(),
    productFlashSaleEndsAt: z.union([z.string(), z.date()]).nullish(),
    productFlashSaleBasePrice: z.number().nullish(),
    productFlashSaleDurationMinutes: z.number().int().min(1).nullish(),
  })
  .passthrough();
