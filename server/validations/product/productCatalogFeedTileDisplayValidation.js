import {
  adminCatalogDisplayPatchBodySchema,
  catalogFeedTileKeyParamsSchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const catalogFeedTileKeyParamValidation = [
  validateParamsZod(catalogFeedTileKeyParamsSchema),
];

export const patchProductCatalogFeedTileDisplayValidation = [
  validateBodyZod(adminCatalogDisplayPatchBodySchema),
];
