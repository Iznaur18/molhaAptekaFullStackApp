import {
  createSellerShelfBodySchema,
  patchSellerShelfBodySchema,
  reorderSellerShelvesBodySchema,
  sellerShelfIdParamsSchema,
  sellerShelfSellerIdParamsSchema,
  setSellerShelfProductsBodySchema,
} from "@molha/api-contract";

import { validateBodyZod } from "../../middlewares/validateBodyZod.js";
import { validateParamsZod } from "../../middlewares/validateParamsZod.js";

export const createSellerShelfValidation = [
  validateBodyZod(createSellerShelfBodySchema),
];

export const patchSellerShelfValidation = [
  validateParamsZod(sellerShelfIdParamsSchema),
  validateBodyZod(patchSellerShelfBodySchema),
];

export const reorderSellerShelvesValidation = [
  validateBodyZod(reorderSellerShelvesBodySchema),
];

export const sellerShelfIdParamValidation = [
  validateParamsZod(sellerShelfIdParamsSchema),
];

export const setSellerShelfProductsValidation = [
  validateParamsZod(sellerShelfIdParamsSchema),
  validateBodyZod(setSellerShelfProductsBodySchema),
];

export const sellerShelfSellerIdParamValidation = [
  validateParamsZod(sellerShelfSellerIdParamsSchema),
];
