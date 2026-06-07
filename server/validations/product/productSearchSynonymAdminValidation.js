import {
  createProductSearchSynonymBodySchema,
  patchProductSearchSynonymBodySchema,
  productSearchSynonymIdParamsSchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const productSearchSynonymIdParamValidation = [
  validateParamsZod(productSearchSynonymIdParamsSchema),
];

export const createProductSearchSynonymValidation = [
  validateBodyZod(createProductSearchSynonymBodySchema),
];

export const patchProductSearchSynonymValidation = [
  validateBodyZod(patchProductSearchSynonymBodySchema),
];
