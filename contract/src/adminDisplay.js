import { z } from "zod";

export const ADMIN_DISPLAY_CUSTOM_LABEL_MAX_LENGTH = 120;
export const ADMIN_DISPLAY_IMAGE_URL_MAX_LENGTH = 2048;

export const adminCatalogDisplayPatchBodySchema = z.object({
  customLabel: z
    .union([z.string(), z.null()])
    .optional()
    .refine(
      (value) => value === undefined || value === null || value.length <= ADMIN_DISPLAY_CUSTOM_LABEL_MAX_LENGTH,
      "customLabel слишком длинный",
    ),
  imageUrl: z
    .union([z.string(), z.null()])
    .optional()
    .refine(
      (value) => value === undefined || value === null || value.length <= ADMIN_DISPLAY_IMAGE_URL_MAX_LENGTH,
      "imageUrl слишком длинный",
    ),
  resetCustomLabel: z.boolean().optional(),
  resetImageUrl: z.boolean().optional(),
});
