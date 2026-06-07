import { productCategoryIdParamsSchema } from "@molha/api-contract";

import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const productCategoryIdParamValidation = [
  validateParamsZod(productCategoryIdParamsSchema),
];
