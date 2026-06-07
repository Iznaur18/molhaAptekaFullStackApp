import { catalogProductsQuerySchema } from "@molha/api-contract";

import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const productsSearchValidation = [validateQueryZod(catalogProductsQuerySchema)];
