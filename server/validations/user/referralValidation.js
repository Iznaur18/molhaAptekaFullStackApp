import { convertPartnerBalanceBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export { convertPartnerBalanceBodySchema };

export const convertPartnerBalanceValidation = [
  validateBodyZod(convertPartnerBalanceBodySchema),
];
