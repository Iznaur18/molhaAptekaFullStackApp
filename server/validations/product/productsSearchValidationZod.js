import { catalogProductsQuerySchema } from "@molha/api-contract";

import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

/** Zod-контракт query для GET /product и GET /product/my */
export const productsSearchValidationZod = [
  validateQueryZod(catalogProductsQuerySchema),
];
