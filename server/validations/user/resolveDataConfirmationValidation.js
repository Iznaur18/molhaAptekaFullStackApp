import {
  dataConfirmationRequestIdParamsSchema,
  resolveDataConfirmationBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const resolveDataConfirmationValidation = [
  validateParamsZod(dataConfirmationRequestIdParamsSchema),
  validateBodyZod(resolveDataConfirmationBodySchema),
];
