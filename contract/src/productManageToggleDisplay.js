import { z } from "zod";

import { ADMIN_DISPLAY_IMAGE_URL_MAX_LENGTH } from "./adminDisplay.js";

/** Синхрон с `server/constants/productManageToggleDisplayConstants.js`. */
export const PRODUCT_MANAGE_TOGGLE_KEY_VALUES = [
  "auction",
  "installment",
  "raffle",
  "visibility",
];

export const productManageToggleKeyParamsSchema = z.object({
  toggleKey: z
    .string()
    .trim()
    .min(1, "toggleKey обязателен")
    .refine(
      (value) => PRODUCT_MANAGE_TOGGLE_KEY_VALUES.includes(value),
      "Неизвестная кнопка управления",
    ),
});

export const adminManageToggleDisplayPatchBodySchema = z.object({
  imageUrl: z
    .union([z.string(), z.null()])
    .optional()
    .refine(
      (value) =>
        value === undefined || value === null || value.length <= ADMIN_DISPLAY_IMAGE_URL_MAX_LENGTH,
      "imageUrl слишком длинный",
    ),
  resetImageUrl: z.boolean().optional(),
});
