import { resolveProductReportsBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const resolveProductReportsValidation = [
  validateBodyZod(resolveProductReportsBodySchema),
];
