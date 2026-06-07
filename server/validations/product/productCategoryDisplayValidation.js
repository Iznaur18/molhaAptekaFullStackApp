import {
  adminCatalogDisplayPatchBodySchema,
  productCategorySlugParamsSchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const productCategorySlugParamValidation = [
  validateParamsZod(productCategorySlugParamsSchema),
];

export const patchProductCategoryDisplayValidation = [
  validateBodyZod(adminCatalogDisplayPatchBodySchema),
];
