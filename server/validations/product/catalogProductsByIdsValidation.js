import { catalogProductsByIdsQuerySchema } from "@molha/api-contract";

import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const catalogProductsByIdsValidation = [
  validateQueryZod(catalogProductsByIdsQuerySchema),
];
