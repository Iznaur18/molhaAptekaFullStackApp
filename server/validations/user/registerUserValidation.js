import { registerBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateRuDeliveryAddress } from "../../middlewares/validateRuDeliveryAddress.js";

export const registerUserValidation = [
  validateBodyZod(registerBodySchema),
  validateRuDeliveryAddress(),
];
