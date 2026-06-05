import { createProductBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

export const makeProductValidationZod = [
  validateBodyZod(createProductBodySchema),
  handleValidationByExpressErrors,
];
