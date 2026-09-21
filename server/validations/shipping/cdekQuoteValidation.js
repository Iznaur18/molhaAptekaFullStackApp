import { z } from "zod";
import {
  mongoIdSchema,
  cdekDeliveryPointsQuerySchema,
  cdekQuoteBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const cdekQuoteValidation = [validateBodyZod(cdekQuoteBodySchema)];

export const cdekAvailabilityValidation = [
  validateQueryZod(z.object({ sellerId: mongoIdSchema })),
];

export const cdekDeliveryPointsValidation = [
  validateQueryZod(cdekDeliveryPointsQuerySchema),
];
