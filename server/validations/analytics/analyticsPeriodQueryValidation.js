import { adminAnalyticsPeriodQuerySchema } from "@molha/api-contract";

import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const analyticsPeriodQueryValidation = [
  validateQueryZod(adminAnalyticsPeriodQuerySchema),
];
