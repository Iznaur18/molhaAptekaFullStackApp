import { userSellerProductsQuerySchema } from "@molha/api-contract";

import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const userSellerProductsValidation = [
  validateQueryZod(userSellerProductsQuerySchema),
];
