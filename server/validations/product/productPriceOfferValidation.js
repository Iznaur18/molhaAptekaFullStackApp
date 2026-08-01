import { offerIdParamsSchema, productPriceOfferBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const productPriceOfferIdParamValidation = [
  validateParamsZod(offerIdParamsSchema),
];

export const submitProductPriceOfferValidation = [
  validateBodyZod(productPriceOfferBodySchema),
];

export const patchProductPriceOfferValidation = [
  validateBodyZod(productPriceOfferBodySchema),
];
