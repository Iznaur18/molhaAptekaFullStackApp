import {
  addCuratedCategoryListItemBodySchema,
  createCuratedCategoryListBodySchema,
  curatedCategoryItemPreviewQuerySchema,
  curatedCategoryListIdParamsSchema,
  curatedCategoryListItemParamsSchema,
  patchCuratedCategoryListBodySchema,
  reorderCuratedCategoryListsBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";
import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const curatedCategoryListIdParamValidation = [
  validateParamsZod(curatedCategoryListIdParamsSchema),
];

export const curatedCategoryListItemParamValidation = [
  validateParamsZod(curatedCategoryListItemParamsSchema),
];

export const curatedCategoryItemPreviewQueryValidation = [
  validateQueryZod(curatedCategoryItemPreviewQuerySchema),
];

export const createCuratedCategoryListValidation = [
  validateBodyZod(createCuratedCategoryListBodySchema),
];

export const patchCuratedCategoryListValidation = [
  validateParamsZod(curatedCategoryListIdParamsSchema),
  validateBodyZod(patchCuratedCategoryListBodySchema),
];

export const reorderCuratedCategoryListsValidation = [
  validateBodyZod(reorderCuratedCategoryListsBodySchema),
];

export const addCuratedCategoryListItemValidation = [
  validateParamsZod(curatedCategoryListIdParamsSchema),
  validateBodyZod(addCuratedCategoryListItemBodySchema),
];
