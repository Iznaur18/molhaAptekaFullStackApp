import { createOrderBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateRuDeliveryAddress } from "../../middlewares/validateRuDeliveryAddress.js";

export const makeOrderValidation = [
  validateBodyZod(createOrderBodySchema),
  validateRuDeliveryAddress({
    lineField: "deliveryAddress",
    flatField: "deliveryAddressFlat",
    lineRequired: true,
  }),
];
