import {
  createRaffleBodySchema,
  patchRaffleBodySchema,
  productIdParamsSchema,
  raffleIdParamsSchema,
  raffleProductsQuerySchema,
  rejectRaffleBodySchema,
  setProductRaffleParticipationBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const createRaffleValidation = [validateBodyZod(createRaffleBodySchema)];

export const patchRaffleValidation = [
  validateParamsZod(raffleIdParamsSchema),
  validateBodyZod(patchRaffleBodySchema),
];

export const raffleIdParamValidation = [validateParamsZod(raffleIdParamsSchema)];

export const rejectRaffleValidation = [
  validateParamsZod(raffleIdParamsSchema),
  validateBodyZod(rejectRaffleBodySchema),
];

export const raffleProductsValidation = [
  validateParamsZod(raffleIdParamsSchema),
  validateQueryZod(raffleProductsQuerySchema),
];

export const setProductRaffleParticipationValidation = [
  validateParamsZod(productIdParamsSchema),
  validateBodyZod(setProductRaffleParticipationBodySchema),
];
