import { verifyEmailWithCodeBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const verifyEmailWithCodeValidation = [
  validateBodyZod(verifyEmailWithCodeBodySchema),
];
