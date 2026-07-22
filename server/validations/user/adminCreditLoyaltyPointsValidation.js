import { adminCreditLoyaltyPointsBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const adminCreditLoyaltyPointsValidation = [
  validateBodyZod(adminCreditLoyaltyPointsBodySchema),
];
