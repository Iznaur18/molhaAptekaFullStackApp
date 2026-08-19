import { productBulkImportJobIdParamsSchema } from "@molha/api-contract";

import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const productBulkImportJobIdParamValidation = [
  validateParamsZod(productBulkImportJobIdParamsSchema),
];
