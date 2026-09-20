import {
  cdekDeliveryPointsQuerySchema,
  cdekQuoteBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const cdekQuoteValidation = [validateBodyZod(cdekQuoteBodySchema)];

export const cdekDeliveryPointsValidation = [
  validateQueryZod(cdekDeliveryPointsQuerySchema),
];
