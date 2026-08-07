import {
  addCuratedProductListItemBodySchema,
  createCuratedProductListBodySchema,
  curatedProductListIdParamsSchema,
  curatedProductListItemParamsSchema,
  curatedProductPreviewParamsSchema,
  patchCuratedProductListBodySchema,
  reorderCuratedProductListsBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const curatedProductListIdParamValidation = [
  validateParamsZod(curatedProductListIdParamsSchema),
];

export const curatedProductListProductIdParamValidation = [
  validateParamsZod(curatedProductListItemParamsSchema),
];

export const curatedProductPreviewParamValidation = [
  validateParamsZod(curatedProductPreviewParamsSchema),
];

export const createCuratedProductListValidation = [
  validateBodyZod(createCuratedProductListBodySchema),
];

export const patchCuratedProductListValidation = [
  validateParamsZod(curatedProductListIdParamsSchema),
  validateBodyZod(patchCuratedProductListBodySchema),
];

export const reorderCuratedProductListsValidation = [
  validateBodyZod(reorderCuratedProductListsBodySchema),
];

export const addCuratedProductListItemValidation = [
  validateParamsZod(curatedProductListIdParamsSchema),
  validateBodyZod(addCuratedProductListItemBodySchema),
];
