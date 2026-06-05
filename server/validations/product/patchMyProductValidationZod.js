import { patchMyProductBodySchema } from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

export const patchMyProductValidationZod = [
  validateBodyZod(patchMyProductBodySchema),
  handleValidationByExpressErrors,
];
