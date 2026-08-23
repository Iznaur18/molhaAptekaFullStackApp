import { updateProfileBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateRuStructuredDeliveryAddress } from "../../middlewares/validateRuStructuredDeliveryAddress.js";
import { validateUserAddressesPatch } from "../../middlewares/validateUserAddressesPatch.js";

export const updateProfileValidation = [
  validateBodyZod(updateProfileBodySchema),
  validateUserAddressesPatch(),
  validateRuStructuredDeliveryAddress(),
];
