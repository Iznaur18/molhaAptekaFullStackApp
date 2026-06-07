import {
  createProductCategoryAdminBodySchema,
  patchProductCategoryAdminBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";

export const createProductCategoryAdminValidation = [
  validateBodyZod(createProductCategoryAdminBodySchema),
];

export const patchProductCategoryAdminValidation = [
  validateBodyZod(patchProductCategoryAdminBodySchema),
];
