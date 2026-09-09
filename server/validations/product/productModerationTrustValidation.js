import {
  productModerationTrustBodySchema,
  productModerationTrustParamsSchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const productModerationTrustValidation = [
  validateParamsZod(productModerationTrustParamsSchema),
  validateBodyZod(productModerationTrustBodySchema),
];
