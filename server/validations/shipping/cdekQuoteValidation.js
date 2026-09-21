import { z } from "zod";
import {
  cdekWaybillBodySchema,
  mongoIdSchema,
  cdekDeliveryPointsQuerySchema,
  cdekQuoteBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const cdekQuoteValidation = [validateBodyZod(cdekQuoteBodySchema)];

export const cdekAvailabilityValidation = [
  validateQueryZod(z.object({ sellerId: mongoIdSchema })),
];

export const cdekDeliveryPointsValidation = [
  validateQueryZod(cdekDeliveryPointsQuerySchema),
];

export const cdekWaybillValidation = [
  validateParamsZod(z.object({ orderId: mongoIdSchema })),
  validateBodyZod(cdekWaybillBodySchema),
];

export const cdekWaybillParamsValidation = [
  validateParamsZod(z.object({ orderId: mongoIdSchema })),
];

export const cdekReceptionPointsValidation = [
  validateQueryZod(z.object({ city: z.string().trim().min(2).max(100) })),
];
