import { updateProfileBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateRuStructuredDeliveryAddress } from "../../middlewares/validateRuStructuredDeliveryAddress.js";

export const updateProfileValidation = [
  validateBodyZod(updateProfileBodySchema),
  validateRuStructuredDeliveryAddress(),
];
