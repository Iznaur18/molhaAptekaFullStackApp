import { userSellerProductsQuerySchema } from "@molha/api-contract";

import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

/** Zod-контракт query для GET /user/:userId/products */
export const userSellerProductsValidationZod = [
  validateQueryZod(userSellerProductsQuerySchema),
];
