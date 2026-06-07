import { getAllOrdersQuerySchema } from "@molha/api-contract";

import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const getAllOrdersValidation = [validateQueryZod(getAllOrdersQuerySchema)];
