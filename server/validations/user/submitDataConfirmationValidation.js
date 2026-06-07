import { submitDataConfirmationBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const submitDataConfirmationValidation = [
  validateBodyZod(submitDataConfirmationBodySchema),
];
