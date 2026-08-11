import {
  activateProductPromoCodeBodySchema,
  replaceProductPromoCodesBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const replaceProductPromoCodesValidation = [
  validateBodyZod(replaceProductPromoCodesBodySchema),
];

export const activateProductPromoCodeValidation = [
  validateBodyZod(activateProductPromoCodeBodySchema),
];
