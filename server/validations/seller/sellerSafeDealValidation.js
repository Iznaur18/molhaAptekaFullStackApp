import {
  safeDealApplicationBodySchema,
  staffSafeDealListQuerySchema,
  staffSafeDealModerationBodySchema,
  staffSafeDealParamsSchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const safeDealApplicationValidation = [
  validateBodyZod(safeDealApplicationBodySchema),
];

export const staffSafeDealListValidation = [
  validateQueryZod(staffSafeDealListQuerySchema),
];

export const staffSafeDealModerationValidation = [
  validateParamsZod(staffSafeDealParamsSchema),
  validateBodyZod(staffSafeDealModerationBodySchema),
];
