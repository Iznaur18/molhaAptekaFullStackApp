import { sellerCommerceDefaultsBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const sellerCommerceDefaultsValidation = [
  validateBodyZod(sellerCommerceDefaultsBodySchema),
];
