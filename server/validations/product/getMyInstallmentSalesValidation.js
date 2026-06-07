import { getMyInstallmentContractsListQuerySchema } from "@molha/api-contract";

import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const getMyInstallmentContractsListValidation = [
  validateQueryZod(getMyInstallmentContractsListQuerySchema),
];

/** @deprecated alias */
export const getMyInstallmentSalesValidation = getMyInstallmentContractsListValidation;
