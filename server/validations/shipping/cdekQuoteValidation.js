import {
  cdekAvailabilityQuerySchema,
  cdekDeliveryPointsQuerySchema,
  cdekIntakeBodySchema,
  cdekOrderIdParamsSchema,
  cdekQuoteBodySchema,
  cdekReceptionPointsQuerySchema,
  cdekWaybillBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const cdekQuoteValidation = [validateBodyZod(cdekQuoteBodySchema)];

export const cdekAvailabilityValidation = [
  validateQueryZod(cdekAvailabilityQuerySchema),
];

export const cdekDeliveryPointsValidation = [
  validateQueryZod(cdekDeliveryPointsQuerySchema),
];

export const cdekWaybillValidation = [
  validateParamsZod(cdekOrderIdParamsSchema),
  validateBodyZod(cdekWaybillBodySchema),
];

export const cdekWaybillParamsValidation = [validateParamsZod(cdekOrderIdParamsSchema)];

export const cdekReceptionPointsValidation = [
  validateQueryZod(cdekReceptionPointsQuerySchema),
];

export const cdekIntakeValidation = [
  validateParamsZod(cdekOrderIdParamsSchema),
  validateBodyZod(cdekIntakeBodySchema),
];
