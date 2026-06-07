import { getMySalesQuerySchema } from "@molha/api-contract";

import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const getMySalesValidation = [validateQueryZod(getMySalesQuerySchema)];
