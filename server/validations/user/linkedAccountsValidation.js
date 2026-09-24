import { authAccountUserIdBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const authAccountUserIdValidation = [
  validateBodyZod(authAccountUserIdBodySchema),
];
