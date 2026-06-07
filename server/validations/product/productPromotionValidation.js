import {
  myProductPromotionsQuerySchema,
  requestProductPromotionBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const requestProductPromotionValidation = [
  validateBodyZod(requestProductPromotionBodySchema),
];

export const myProductPromotionsValidation = [
  validateQueryZod(myProductPromotionsQuerySchema),
];
