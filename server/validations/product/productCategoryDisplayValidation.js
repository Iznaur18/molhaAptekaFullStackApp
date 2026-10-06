import {
  adminCatalogDisplayPatchBodySchema,
  categoryDisplaySettingsPatchBodySchema,
  productCategoryDisplaySlugParamsSchema,
  productCategorySlugParamsSchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";
import { productCategoryIdParamValidation } from "./productCategoryTreeValidation.js";

export const productCategorySlugParamValidation = [
  validateParamsZod(productCategorySlugParamsSchema),
];

export const patchProductCategoryDisplayValidation = [
  validateParamsZod(productCategoryDisplaySlugParamsSchema),
  validateBodyZod(adminCatalogDisplayPatchBodySchema),
];

export const patchProductCategoryDisplaySettingsValidation = [
  validateBodyZod(categoryDisplaySettingsPatchBodySchema),
];

export const patchProductCategoryNodeDisplayValidation = [
  ...productCategoryIdParamValidation,
  validateBodyZod(adminCatalogDisplayPatchBodySchema),
];
