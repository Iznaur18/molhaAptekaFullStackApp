import { productIdParamsSchema } from "@molha/api-contract";

import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const productIdParamValidation = [validateParamsZod(productIdParamsSchema)];
