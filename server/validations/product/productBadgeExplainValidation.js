import {
  adminProductBadgeExplainPatchBodySchema,
  productBadgeExplainKeyParamsSchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const productBadgeExplainKeyParamValidation = [
  validateParamsZod(productBadgeExplainKeyParamsSchema),
];

export const patchProductBadgeExplainValidation = [
  validateBodyZod(adminProductBadgeExplainPatchBodySchema),
];
