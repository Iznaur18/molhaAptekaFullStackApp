import {
  confirmRegistrationBodySchema,
  resendRegistrationCodeBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const confirmRegistrationValidation = validateBodyZod(
  confirmRegistrationBodySchema,
);

export const resendRegistrationCodeValidation = validateBodyZod(
  resendRegistrationCodeBodySchema,
);
