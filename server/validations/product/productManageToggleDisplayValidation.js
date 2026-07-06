import {
  adminManageToggleDisplayPatchBodySchema,
  productManageToggleKeyParamsSchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const productManageToggleKeyParamValidation = [
  validateParamsZod(productManageToggleKeyParamsSchema),
];

export const patchProductManageToggleDisplayValidation = [
  validateBodyZod(adminManageToggleDisplayPatchBodySchema),
];
