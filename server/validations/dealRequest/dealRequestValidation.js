import {
  acceptDealRequestBodySchema,
  createDealRequestBodySchema,
  dealRequestIdParamsSchema,
  dealRequestOutcomeBodySchema,
  dealRequestProductIdParamsSchema,
  declineDealRequestBodySchema,
  listMyDealRequestsQuerySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const createDealRequestValidation = [
  validateBodyZod(createDealRequestBodySchema),
];

export const listMyDealRequestsValidation = [
  validateQueryZod(listMyDealRequestsQuerySchema),
];

export const dealRequestIdParamValidation = [
  validateParamsZod(dealRequestIdParamsSchema),
];

export const acceptDealRequestValidation = [
  validateParamsZod(dealRequestIdParamsSchema),
  validateBodyZod(acceptDealRequestBodySchema),
];

export const declineDealRequestValidation = [
  validateParamsZod(dealRequestIdParamsSchema),
  validateBodyZod(declineDealRequestBodySchema),
];

export const dealRequestOutcomeValidation = [
  validateParamsZod(dealRequestIdParamsSchema),
  validateBodyZod(dealRequestOutcomeBodySchema),
];

export const dealRequestSellerContactValidation = [
  validateParamsZod(dealRequestProductIdParamsSchema),
];
