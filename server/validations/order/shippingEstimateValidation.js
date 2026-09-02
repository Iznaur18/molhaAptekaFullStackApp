import { shippingEstimateBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const shippingEstimateValidation = [
  validateBodyZod(shippingEstimateBodySchema),
];
