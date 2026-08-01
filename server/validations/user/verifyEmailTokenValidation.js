import { verifyEmailTokenQuerySchema } from "@molha/api-contract";

import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const verifyEmailTokenValidation = [
  validateQueryZod(verifyEmailTokenQuerySchema),
];
