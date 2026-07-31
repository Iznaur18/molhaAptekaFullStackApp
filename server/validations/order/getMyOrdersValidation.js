import { getMyOrdersQuerySchema } from "@molha/api-contract";

import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const getMyOrdersValidation = [validateQueryZod(getMyOrdersQuerySchema)];
