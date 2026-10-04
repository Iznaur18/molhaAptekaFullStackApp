import {
  shippingCarrierInfoBodySchema,
  shippingCarrierInfoParamsSchema,
  shippingCarrierToggleBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const shippingCarrierToggleValidation = [
  validateBodyZod(shippingCarrierToggleBodySchema),
];

export const shippingCarrierInfoValidation = [
  validateParamsZod(shippingCarrierInfoParamsSchema),
  validateBodyZod(shippingCarrierInfoBodySchema),
];
