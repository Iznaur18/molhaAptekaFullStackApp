import { body, param } from "express-validator";

import { PRODUCT_CATEGORY_VALUES } from "../../constants/productConstants.js";
import {
  PRODUCT_SEARCH_SYNONYM_CATEGORIES_MAX,
  PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH,
  PRODUCT_SEARCH_SYNONYM_TOKEN_MAX_LENGTH,
} from "../../constants/productSearchSynonymConstants.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

export const productSearchSynonymIdParamValidation = [
  param("synonymId").isMongoId().withMessage("synonymId должен быть валидным ObjectId"),
  handleValidationByExpressErrors,
];

export const createProductSearchSynonymValidation = [
  body("token").isString().trim().isLength({
    min: PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH,
    max: PRODUCT_SEARCH_SYNONYM_TOKEN_MAX_LENGTH,
  }),
  body("categories")
    .isArray({ min: 1, max: PRODUCT_SEARCH_SYNONYM_CATEGORIES_MAX })
    .withMessage("categories — массив slug"),
  body("categories.*").isString().trim().isIn(PRODUCT_CATEGORY_VALUES),
  handleValidationByExpressErrors,
];

export const patchProductSearchSynonymValidation = [
  body("token").optional().isString().trim().isLength({
    min: PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH,
    max: PRODUCT_SEARCH_SYNONYM_TOKEN_MAX_LENGTH,
  }),
  body("categories")
    .optional()
    .isArray({ min: 1, max: PRODUCT_SEARCH_SYNONYM_CATEGORIES_MAX }),
  body("categories.*").optional().isString().trim().isIn(PRODUCT_CATEGORY_VALUES),
  handleValidationByExpressErrors,
];
