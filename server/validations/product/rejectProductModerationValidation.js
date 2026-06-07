import { rejectProductModerationBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const rejectProductModerationValidation = [
  validateBodyZod(rejectProductModerationBodySchema),
];
